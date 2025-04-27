package com.kefaihub.rest.internal.resource.v1_0;

import com.kefaihub.rest.dto.v1_0.EventResponse;
import com.kefaihub.rest.internal.service.KefaiHubService;
import com.kefaihub.rest.resource.v1_0.KefaiHubResource;
import com.liferay.object.model.ObjectEntry;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.search.filter.Filter;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.vulcan.pagination.Page;
import com.liferay.portal.vulcan.pagination.Pagination;

import javax.validation.constraints.NotNull;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ServiceScope;


/**
 * @author macia
 */
@Component(
	properties = "OSGI-INF/liferay/rest/v1_0/kefai-hub.properties",
	scope = ServiceScope.PROTOTYPE, service = KefaiHubResource.class
)
public class KefaiHubResourceImpl extends BaseKefaiHubResourceImpl {

	private static final Log _log = LogFactoryUtil.getLog(KefaiHubResourceImpl.class);
	
	@Reference
	private KefaiHubService _kefaiHubService;
	
	@Reference
	private GroupLocalService _groupLocalService;
	
	@Reference
	private ObjectEntryLocalService _objectEntryLocalService;
	
	@Override
	public Page<EventResponse> getEvents(@NotNull String siteId, String search, String sortBy, String orderBy,
			Filter filter, Pagination pagination) throws Exception {
		
		if (_log.isDebugEnabled()) {
			_log.debug("[INIT] - getEvents");
			_log.debug("\tsiteId : " + siteId);
			_log.debug("\tsearch : " + search);
			_log.debug("\tsearch : " + filter);
			_log.debug("\tsortBy : " + sortBy);
			_log.debug("\torderBy : " + orderBy);
			_log.debug("\tpagination : " + pagination.toString());
		}
		
		return _kefaiHubService.getEvents(siteId, search, sortBy, orderBy, filter, pagination);
	}

	@Override
	public EventResponse postEvent(@NotNull String siteId, EventResponse eventResponse) throws Exception {
		if (_log.isDebugEnabled()) {
			_log.debug("[INIT] - postEvent");
			_log.debug("\tsiteId : " + siteId);
			_log.debug("\teventResponse : " + eventResponse.toString());
		}
		
		Group group = null;
		
		try {
			group = _groupLocalService.getGroup(Long.valueOf(siteId));
		} catch (Exception e) {
		}
		
		if (group == null) {
			try {
				group = _groupLocalService.getGroup(contextCompany.getCompanyId(), siteId);	
			} catch (Exception e) {
				throw new PortalException("Group " + siteId + " doesn't exists!");
			}
		}
		
		return _kefaiHubService.postEvent(contextCompany.getCompanyId(), group.getGroupId(),contextUser.getUserId(), eventResponse);
	}

	@Override
	public EventResponse getEvent(@NotNull String eventId) throws Exception {
		if (_log.isDebugEnabled()) {
			_log.debug("[INIT] - getEvent");
			_log.debug("\teventId : " + eventId);
		}
		
		ObjectEntry objectentry = _objectEntryLocalService.getObjectEntry(Long.valueOf(eventId));

		return _kefaiHubService.getEvent(String.valueOf(objectentry.getGroupId()), 
				objectentry.getExternalReferenceCode());
	}
	
	
	
}