export interface UserRole {
    id: number;
    name: string;
}
export interface User {
    id: number;
    username: string;
    roleId: number;
    role: UserRole;
    roleName: string;
    createdAt: string;
}
export interface UserCreateDto {
    username: string;
    password?: string;
    roleId: number;
}
export interface UserUpdateDto {
    username: string;
    password?: string | null;
    roleId: number;
}
export interface DecodedToken {
    nameid: string;
    unique_name: string;
    role: string;
    nbf?: number;
    exp?: number;
    iat?: number;
    iss?: string;
    aud?: string;
}
export interface ProjectStatus {
    id: number;
    value: string;
}
export interface ProjectType {
    id: number;
    value: string;
}
export interface ProjectDetail {
    projectId: number;
    fullDescription?: string | null;
    knownBugs?: string | null;
    architectureSummary?: string | null;
}
export interface ProjectNote {
    id: number;
    projectId: number;
    noteText?: string | null;
    createdAt: string;
}
export interface ProjectFile {
    id: number;
    projectId: number;
    fileName: string; 
    filePath: string; 
    description?: string | null;
    uploadedAt: string; 
    categoryId: number; 
    categoryName?: string | null;
}
export interface Project {
    id: number;
    title: string;
    shortDescription?: string | null;
    typeId: number;
    type: string; 
    statusId: number;
    status: string;
    ownerId: number;
    ownerUsername: string;
    createdAt: string;
    updatedAt?: string | null;
    detail?: ProjectDetail | null;
    notes?: ProjectNote[];
    files?: ProjectFile[];
}
export interface AppSetting {
    id: number;
    key: string;    
    value: string; 
}
export interface ProjectUpdateDto {
    title: string;
    shortDescription?: string | null;
    typeId: number;
    statusId: number;
}
export interface ProjectFileCategory {
    id: number;
    name: string;
}
export interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}
