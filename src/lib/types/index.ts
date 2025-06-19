export interface Founder {
    fullName: string;
    email: string;
    linkedin: string;
}

export interface Startup {
    name: string;
    website: string;
    description: string;
    oneLiner: string;
    founders: Founder[];
    commonResponses: {
        [question: string]: string;
    };
} 