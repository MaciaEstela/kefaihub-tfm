package com.kefaihub.rest.internal.service;

import com.kefaihub.rest.dto.v1_0.EventResponse;
import com.kefaihub.rest.dto.v1_0.LocationResponse;
import com.kefaihub.rest.dto.v1_0.RemoteResponse;
import com.kefaihub.rest.internal.constants.ApiQueryConstants;
import com.kefaihub.rest.internal.constants.KefaiHubConstants;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManager;
import com.liferay.object.rest.manager.v1_0.ObjectEntryManagerRegistry;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.object.service.ObjectRelationshipLocalService;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.search.Sort;
import com.liferay.portal.kernel.search.filter.Filter;
import com.liferay.portal.kernel.security.auth.CompanyThreadLocal;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.vulcan.dto.converter.DefaultDTOConverterContext;
import com.liferay.portal.vulcan.pagination.Page;
import com.liferay.portal.vulcan.pagination.Pagination;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

@Component(immediate = true, service = KefaiHubService.class)
public class KefaiHubService {

	private static final Log _log = LogFactoryUtil.getLog(KefaiHubService.class);
	
	@Reference
	private ObjectDefinitionLocalService _objectDefinitionLocalService;
	
	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;
	
	@Reference
	private ObjectRelationshipLocalService _objectRelationshipLocalService;
	
	@Reference
	private UserLocalService _userLocalService;
	
	@Reference
	private ObjectEntryManagerRegistry _objectEntryManagerRegistry;
	
	@Reference
	private GroupLocalService _groupLocalService;
	
	public Page<EventResponse> getEvents(
		String siteId, String search, String sortBy, String orderBy,
		Filter filter, Pagination pagination) throws Exception {
		
		Group group = getGroupByKeyOrGroupId(siteId);
		if (group == null) {
			_log.warn("Group with ID or Key " + siteId + " not found");
			return Page.of(Collections.emptyList());
		}
		
		long companyId = group.getCompanyId();
		Sort[] sorts = getSorts(sortBy, orderBy);
		Pagination liferayPagination = getLiferayPagination(pagination);
		
		ObjectDefinition objectDefinition = _objectDefinitionLocalService
				.getObjectDefinitionByExternalReferenceCode(KefaiHubConstants.Event.ERC, companyId);
		
		ObjectEntryManager manager = _objectEntryManagerRegistry.getObjectEntryManager(objectDefinition.getStorageType());
		
		Page<com.liferay.object.rest.dto.v1_0.ObjectEntry> objectEntries = getFilteredObjectEntries(
			manager, objectDefinition, group.getGroupId(), companyId,
			"", search, liferayPagination, sorts);
		
		List<EventResponse> events = objectEntries.getItems()
			.stream()
			.map(entry -> safeToEventResponse(entry, group))
			.filter(Objects::nonNull)
			.collect(Collectors.toList());
		
		return Page.of(events, pagination, objectEntries.getTotalCount());
	}
	
	public EventResponse postEvent(long companyId, long groupId, long userId, EventResponse eventResponse) throws Exception {
		validateEvent(eventResponse);
		
		Map<String, Serializable> values = new HashMap<>();
		values.put(KefaiHubConstants.Event.TITLE_I18N, (Serializable) eventResponse.getTitle_i18n());
		values.put(KefaiHubConstants.Event.DESCRIPTION_I18N, (Serializable) eventResponse.getDescription_i18n());
		values.put(KefaiHubConstants.Event.DETAILS_URL_I18N, (Serializable) eventResponse.getDetailsUrl_i18n());
		values.put(KefaiHubConstants.Event.DATE, eventResponse.getDate());
		values.put(KefaiHubConstants.Event.PRICE, eventResponse.getPrice());
		values.put(KefaiHubConstants.Event.IS_PRIVATE, eventResponse.getIsPrivate());
		values.put(KefaiHubConstants.Event.CATEGORY, eventResponse.getCategory());
		values.put(KefaiHubConstants.Event.EVENT_TYPE, eventResponse.getEventType());
		values.put(KefaiHubConstants.Event.REL_PROVINCE, eventResponse.getProvinceResponse().getId());
		
		ObjectDefinition eventDefinition = _objectDefinitionLocalService
				.getObjectDefinitionByExternalReferenceCode(KefaiHubConstants.Event.ERC, companyId);
		
		ObjectEntry objectEntry = _objectEntryLocalService.addObjectEntry(
				userId, groupId, eventDefinition.getObjectDefinitionId(), values, new ServiceContext());
		
		if (isHybridOrOnsite(eventResponse)) {
			postLocation(groupId, userId, objectEntry.getObjectEntryId(), eventResponse.getLocationResponse());
		}
		if (isHybridOrOnline(eventResponse)) {
			postRemote(groupId, userId, objectEntry.getObjectEntryId(), eventResponse.getRemoteResponse());
		}
		
		return getEvent(String.valueOf(groupId), objectEntry.getExternalReferenceCode());
	}
	
	private void validateEvent(EventResponse eventResponse) throws PortalException {
		if (isNullOrEmpty(eventResponse.getTitle_i18n().get("ca_ES"))) {
			throw new PortalException("Title (ca_ES) can't be empty!");
		}
		if (isNullOrEmpty(eventResponse.getDescription_i18n().get("ca_ES"))) {
			throw new PortalException("Description (ca_ES) can't be empty!");
		}
		if (isNullOrEmpty(eventResponse.getDate())) {
			throw new PortalException("Date can't be empty!");
		}
		if (isNullOrEmpty(eventResponse.getCategory())) {
			throw new PortalException("Category can't be empty!");
		}
		if (isNullOrEmpty(eventResponse.getEventType())) {
			throw new PortalException("EventType can't be empty!");
		}
	}
	
	private boolean isNullOrEmpty(String value) {
		return value == null || value.trim().isEmpty();
	}
	
	private boolean isHybridOrOnsite(EventResponse eventResponse) {
		return KefaiHubConstants.EventType.HYBRID.equals(eventResponse.getEventType()) ||
				KefaiHubConstants.EventType.ONSITE.equals(eventResponse.getEventType());
	}
	
	private boolean isHybridOrOnline(EventResponse eventResponse) {
		return KefaiHubConstants.EventType.HYBRID.equals(eventResponse.getEventType()) ||
				KefaiHubConstants.EventType.ONLINE.equals(eventResponse.getEventType());
	}
	
	private long postLocation(long groupId, long userId, long objectEntryId, LocationResponse locationResponse) throws PortalException {
		Group group = _groupLocalService.getGroup(groupId);
		
		ObjectDefinition locationDefinition = _objectDefinitionLocalService
				.getObjectDefinitionByExternalReferenceCode(KefaiHubConstants.Location.ERC, group.getCompanyId());
		
		Map<String, Serializable> values = new HashMap<>();
		values.put(KefaiHubConstants.Location.ADDRESS_I18N, (Serializable) locationResponse.getAddress_i18n());
		values.put(KefaiHubConstants.Location.LATITUDE, locationResponse.getLatitude());
		values.put(KefaiHubConstants.Location.LONGITUDE, locationResponse.getLongitude());
		values.put(KefaiHubConstants.Location.REL_EVENT, objectEntryId);
		
		ObjectEntry locationEntry = _objectEntryLocalService.addObjectEntry(
				userId, groupId, locationDefinition.getObjectDefinitionId(), values, new ServiceContext());
		
		return locationEntry.getObjectEntryId();
	}
	
	private long postRemote(long groupId, long userId, long objectEntryId, RemoteResponse remoteResponse) throws PortalException {
		Group group = _groupLocalService.getGroup(groupId);
		
		ObjectDefinition remoteDefinition = _objectDefinitionLocalService
				.getObjectDefinitionByExternalReferenceCode(KefaiHubConstants.Remote.ERC, group.getCompanyId());
		
		Map<String, Serializable> values = new HashMap<>();
		values.put(KefaiHubConstants.Remote.URL, remoteResponse.getUrl());
		values.put(KefaiHubConstants.Remote.REL_EVENT, objectEntryId);
		
		ObjectEntry remoteEntry = _objectEntryLocalService.addObjectEntry(
				userId, groupId, remoteDefinition.getObjectDefinitionId(), values, new ServiceContext());
		
		return remoteEntry.getObjectEntryId();
	}
	
	public Page<com.liferay.object.rest.dto.v1_0.ObjectEntry> getFilteredObjectEntries(
		ObjectEntryManager manager, ObjectDefinition definition, long groupId, long companyId,
		String filter, String search, Pagination pagination, Sort[] sorts) throws Exception {
		
		return manager.getObjectEntries(
			companyId, definition, String.valueOf(groupId), null,
			new DefaultDTOConverterContext(false, null, null, null, LocaleUtil.getDefault(), null, null),
			filter, pagination, search, sorts);
	}
	
	public Group getGroupByKeyOrGroupId(String groupIdOrKey) throws PortalException {
		Group group = null;
		try {
			group = _groupLocalService.fetchGroup(Long.parseLong(groupIdOrKey));
		} catch (NumberFormatException e) {
			_log.debug("Group identifier '" + groupIdOrKey + "' is not a valid ID.");
		}
		if (group == null) {
			long companyId = CompanyThreadLocal.getCompanyId();
			group = _groupLocalService.fetchGroup(companyId, groupIdOrKey);
		}
		if (group == null) {
			throw new PortalException("Group identifier does not match any groupId or groupKey.");
		}
		return group;
	}
	
	public Sort[] getSorts(String sortBy, String orderBy) {
		String sortField = (sortBy != null) ? sortBy : ApiQueryConstants.SORT_FIELD_CREATE_DATE;
		boolean ascending = (orderBy == null || ApiQueryConstants.SORT_ORDER_ASC.equalsIgnoreCase(orderBy));
		return new Sort[]{new Sort(sortField, ascending)};
	}
	
	public Pagination getLiferayPagination(Pagination pagination) {
		int page = ApiQueryConstants.PAGINATION_FIELD_FROM;
		int pageSize = ApiQueryConstants.PAGINATION_FIELD_TO;
		if (pagination != null) {
			page = pagination.getPage();
			pageSize = pagination.getPageSize();
		}
		return Pagination.of(page, pageSize);
	}
	
	private EventResponse safeToEventResponse(com.liferay.object.rest.dto.v1_0.ObjectEntry entry, Group group) {
		try {
			return _toEventResponse(entry, group);
		} catch (Exception e) {
			_log.error("Error converting ObjectEntry to EventResponse", e);
			return null;
		}
	}
	
	private EventResponse _toEventResponse(com.liferay.object.rest.dto.v1_0.ObjectEntry entry, Group group) throws Exception {
		EventResponse response = new EventResponse();
		Map<String, Object> props = entry.getProperties();
		
		response.setTitle_i18n((Map<String, String>) props.get(KefaiHubConstants.Event.TITLE_I18N));
		response.setDescription_i18n((Map<String, String>) props.get(KefaiHubConstants.Event.DESCRIPTION_I18N));
		response.setDetailsUrl_i18n((Map<String, String>) props.get(KefaiHubConstants.Event.DETAILS_URL_I18N));
		
		response.setId(Math.toIntExact(entry.getId()));
		
		JSONObject eventType = JSONFactoryUtil.createJSONObject(String.valueOf(props.get(KefaiHubConstants.Event.EVENT_TYPE)));
		response.setEventType(eventType.getString("key"));
		
		response.setIsPrivate((Boolean) props.get(KefaiHubConstants.Event.IS_PRIVATE));
		
		JSONObject category = JSONFactoryUtil.createJSONObject(String.valueOf(props.get(KefaiHubConstants.Event.CATEGORY)));
		response.setCategory(category.getString("key"));
		
		Object price = props.get(KefaiHubConstants.Event.PRICE);
		if (price instanceof BigDecimal) {
			response.setPrice(((BigDecimal) price).doubleValue());
		} else if (price instanceof Number) {
			response.setPrice(((Number) price).doubleValue());
		}
		
		response.setLocationResponse(loadLocation(entry.getId(), group));
		response.setRemoteResponse(loadRemote(entry.getId(), group));
		
		return response;
	}
	
	private LocationResponse loadLocation(Long eventId, Group group) throws Exception {
		Sort[] sorts = getSorts(null, null);
		Pagination pagination = getLiferayPagination(null);
		
		ObjectDefinition locationDef = _objectDefinitionLocalService
				.getObjectDefinitionByExternalReferenceCode(KefaiHubConstants.Location.ERC, group.getCompanyId());
		
		ObjectEntryManager manager = _objectEntryManagerRegistry.getObjectEntryManager(locationDef.getStorageType());
		
		String filter = KefaiHubConstants.Location.REL_EVENT + " eq '" + eventId + "'";
		Page<com.liferay.object.rest.dto.v1_0.ObjectEntry> entries = getFilteredObjectEntries(
				manager, locationDef, group.getGroupId(), group.getCompanyId(), filter, StringPool.BLANK, pagination, sorts);
		
		return entries.getItems().stream()
			.findFirst()
			.map(this::toLocationResponse)
			.orElse(null);
	}
	
	private LocationResponse toLocationResponse(com.liferay.object.rest.dto.v1_0.ObjectEntry entry) {
		LocationResponse response = new LocationResponse();
		Map<String, Object> props = entry.getProperties();
		
		response.setLatitude(props.get(KefaiHubConstants.Location.LATITUDE).toString());
		response.setLongitude(props.get(KefaiHubConstants.Location.LONGITUDE).toString());
		response.setAddress_i18n((Map<String, String>) props.get(KefaiHubConstants.Location.ADDRESS_I18N));
		
		return response;
	}
	
	private RemoteResponse loadRemote(Long eventId, Group group) throws Exception {
		Sort[] sorts = getSorts(null, null);
		Pagination pagination = getLiferayPagination(null);
		
		ObjectDefinition remoteDefinition = _objectDefinitionLocalService
				.getObjectDefinitionByExternalReferenceCode(KefaiHubConstants.Remote.ERC, group.getCompanyId());
		
		ObjectEntryManager manager = _objectEntryManagerRegistry.getObjectEntryManager(remoteDefinition.getStorageType());
		
		String filter = KefaiHubConstants.Remote.REL_EVENT + " eq '" + eventId + "'";
		Page<com.liferay.object.rest.dto.v1_0.ObjectEntry> entries = getFilteredObjectEntries(
				manager, remoteDefinition, group.getGroupId(), group.getCompanyId(), filter, StringPool.BLANK, pagination, sorts);
		
		return entries.getItems().stream()
			.findFirst()
			.map(this::toRemoteResponse)
			.orElse(null);
	}
	
	private RemoteResponse toRemoteResponse(com.liferay.object.rest.dto.v1_0.ObjectEntry entry) {
		RemoteResponse response = new RemoteResponse();
		Map<String, Object> props = entry.getProperties();
		
		Object urlObj = props.get(KefaiHubConstants.Remote.URL);
		if (urlObj != null) {
			response.setUrl(urlObj.toString());
		}
		
		return response;
	}
	
	public EventResponse getEvent(String siteId, String externalReferenceCode) throws Exception {
		Group group = getGroupByKeyOrGroupId(siteId);
		if (group == null) {
			_log.warn("Group with " + siteId + " not found");
			return null;
		}
		
		long companyId = group.getCompanyId();
		String scopeKey = String.valueOf(group.getGroupId());
		ObjectDefinition objectDefinition = _objectDefinitionLocalService.getObjectDefinitionByExternalReferenceCode(
				KefaiHubConstants.Event.ERC, companyId);
		
		ObjectEntryManager manager = _objectEntryManagerRegistry.getObjectEntryManager(objectDefinition.getStorageType());
		com.liferay.object.rest.dto.v1_0.ObjectEntry objectEntry = manager.getObjectEntry(
			companyId,
			new DefaultDTOConverterContext(false, null, null, null, LocaleUtil.getDefault(), null, null),
			externalReferenceCode,
			objectDefinition,
			scopeKey
		);
		
		if (objectEntry == null) {
			return null;
		}

		EventResponse eventResponse = _toEventResponse(objectEntry, group);
		
		// Opcional: cargar también Location y Remote si quieres.
		eventResponse.setLocationResponse(loadLocation(objectEntry.getId(), group));
		eventResponse.setRemoteResponse(loadRemote(objectEntry.getId(), group));
		
		return eventResponse;
	}
}