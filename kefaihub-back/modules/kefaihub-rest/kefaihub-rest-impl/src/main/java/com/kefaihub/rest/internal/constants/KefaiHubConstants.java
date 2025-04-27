package com.kefaihub.rest.internal.constants;

public class KefaiHubConstants {
	
	public static final String I18N = "i18n";
	public static final String UNDERSCORE = "_";
	
	public static final class Event {
		public static final String ERC = "erc-obj-event";
		public static final String STATUS = "status";
		public static final String ID = "id";
		public static final String TITLE = "title";
		public static final String TITLE_I18N = "title_i18n";
		public static final String DESCRIPTION = "description";
		public static final String DESCRIPTION_I18N = "description_i18n";
		public static final String DATE = "date";
		public static final String PRICE = "price";
		public static final String IS_PRIVATE = "isPrivate";
		public static final String CATEGORY = "category";
		public static final String DETAILS_URL = "detailsUrl";
		public static final String DETAILS_URL_I18N = "detailsUrl_i18n";
		public static final String EVENT_TYPE = "eventType";
		public static final String PROVINCE = "province";
		public static final String REL_LOCATION = "location";
		public static final String REL_REMOTE = "remote";
		
		public static final String REL_PROVINCE = "r_province_c_provinceId";
	}
	
	public static final class Province {
		public static final String ERC = "erc-obj-province";
		public static final String NAME = "name";
		public static final String PROVINCE_CODE = "provinceCode";
		public static final long ID_LLEIDA = 32921;
		public static final long ID_BARCELONA = 32923;
		public static final long ID_TARRAGONA = 32925;
		public static final long ID_GIRONA = 32927;
	}
	
	public static final class Location {
		public static final String ERC = "erc-obj-location";
		public static final String LATITUDE = "latitude";
		public static final String LONGITUDE = "longitude";
		public static final String ADDRESS_I18N = "address_i18n";
		public static final String REL_EVENT = "r_location_c_eventId";
	}
	
	public static final class Remote {
		public static final String ERC = "erc-obj-remote";
		public static final String URL = "url";
		public static final String REL_EVENT = "r_remote_c_eventId";
	}
	
	public static final class EventCategory {
		public static final String ERC = "erc-list-eventcategory";
		public static final String ARTS_AND_CULTURE = "ArtsAndCulture";
		public static final String MUSIC_AND_SHOWS = "MusicAndShows";
		public static final String GASTRONOMY = "Gastronomy";
		public static final String WORKSHOPS_AND_TRAINING = "WorkshopsAndTraining";
		public static final String SPORT_AND_WELLNESS = "SportsAndWellness";
		public static final String FESTIVITIES_AND_TRADITIONS = "FestivitiesAndTraditions";
		public static final String OTHERS = "Others";
	}
	
	public static final class EventType {
		public static final String ERC = "erc-list-eventtype";
		public static final String ONSITE = "Onsite";
		public static final String HYBRID = "Hybrid";
		public static final String ONLINE = "Online";
	}
	
	private KefaiHubConstants() {
		// Prevent instantiation
	}
}

