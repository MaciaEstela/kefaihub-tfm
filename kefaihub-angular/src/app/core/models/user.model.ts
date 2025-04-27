export interface User {
  id: number;
  alternateName: string;
  emailAddress: string;
  familyName: string;
  givenName: string;
  jobTitle?: string;
  birthDate?: string;
  honorificPrefix?: string;
  honorificSuffix?: string;
  image?: string;
  profileURL?: string;
  roleBriefs?: RoleBrief[];
  siteBriefs?: SiteBrief[];
}

export interface RoleBrief {
  id: number;
  name: string;
  externalReferenceCode?: string;
}

export interface SiteBrief {
  id: number;
  name: string;
}

export interface UserListResponse {
  items: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  lastPage: number;
}