export interface MetadataType {
    name: string;
    tagline: string;
    icon: {
        dark: string;
        light: string;
        transparent: string;
        transparentSVG: string;
    };
    author: {
        name: string;
        email: string;
        portfolio: string;
    }
    publishedOn: Date;
    lastUpdatedOn: Date;
    version: string;
    versionCode: number;
};

export interface ClientAppDataType {
    appIcon: string;
    appName: string;
    appSecret: string;
    author: string;
    createdOn: Date;
    id: string;
    version: string;
    website: string;
    privacyPolicy: string;
    contact: string;
    redirectUrl: string[];
    inactiveMessage: string;
    status: "active" | "suspended" | "inactive";
    inactiveUntil: Date | null;
    scope: string[];
    description: string;
    appType: "web application"
    | "android application"
    | "ios application"
    | "native application";
}
