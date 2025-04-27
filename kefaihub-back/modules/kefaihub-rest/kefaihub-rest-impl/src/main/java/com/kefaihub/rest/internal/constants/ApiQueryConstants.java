package com.kefaihub.rest.internal.constants;

public class ApiQueryConstants {

	public static final String SORT_ORDER_DESC = "desc";
	public static final String SORT_ORDER_ASC = "asc";
	
	public static final String SORT_FIELD_CREATE_DATE = "createDate";
	
	public static final int PAGINATION_FIELD_FROM = 1;
	public static final int PAGINATION_FIELD_TO = 20;
	
	public static final String OPERATOR_AND = " and ";
	public static final String OPERATOR_EQUALS = " eq ";
	public static final String OPERATOR_OR = " or ";
	
	/**
	 * Private constructor to prevent instantiation
	 */
	private ApiQueryConstants() {
		// Prevent instantiation
	}
}