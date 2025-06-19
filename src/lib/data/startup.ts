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

export const startupData: Startup = {
    name: "Suparaise",
    website: "https://suparaise.com",
    description: "Suparaise is an agentic tool engine for automated VC fundraising and investor outreach.",
    oneLiner: "Agentic tool engine for automated VC fundraising and investor outreach.",
    founders: [
        {
            fullName: "Babacar Dia",
            email: "babacar@suparaise.com",
            linkedin: "https://linkedin.com/in/babacardia",
        }
    ],
    commonResponses: {
        "What is your company working on?": "Suparaise is an agentic tool engine for automated VC fundraising and investor outreach.",
        "How do you make money?": "We plan to operate on a SaaS model with different tiers based on the number of investors targeted and features used. We will also explore a success-fee model for successfully raised rounds.",
        "Who are your competitors?": "Our main competitors are manual processes, individual freelancers, and larger platforms that touch on parts of the fundraising process like CRM for investors. However, no one is currently offering a fully autonomous, end-to-end agent-based solution for form filling and outreach."
    }
}; 