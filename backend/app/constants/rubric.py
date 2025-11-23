# Sports Partnership Sales Call Evaluation Rubric
# Based on industry research for professional sports sponsorship sales

SPORTS_PARTNERSHIP_RUBRIC = {
    "categories": [
        {
            "name": "Rapport & Relationship Building",
            "weight": 0.15,
            "description": "Ability to establish trust and personal connection with the prospect",
            "criteria": [
                "Opens with genuine personal connection or relevant business insight",
                "Demonstrates knowledge of prospect's company, industry, or recent achievements",
                "Uses active listening and builds on prospect's responses",
                "Shows enthusiasm without being overly pushy",
                "Maintains professional yet personable tone throughout"
            ],
            "evaluation_points": {
                "excellent": "Natural rapport, personalized approach, prospect is engaged and reciprocating",
                "good": "Professional connection, some personalization, respectful dialogue",
                "fair": "Generic opening, limited personalization, one-sided conversation",
                "poor": "No rapport building, jumps straight to pitch, doesn't acknowledge prospect's context"
            }
        },
        {
            "name": "Discovery & Needs Assessment",
            "weight": 0.25,
            "description": "Quality of questions asked to understand sponsor's objectives and challenges",
            "criteria": [
                "Asks open-ended questions about business objectives",
                "Probes for specific KPIs and success metrics (awareness, leads, hospitality, etc.)",
                "Identifies decision-making process and timeline",
                "Uncovers budget parameters and approval requirements",
                "Understands target audience alignment with fanbase demographics",
                "Explores past sponsorship experiences and what worked/didn't work"
            ],
            "evaluation_points": {
                "excellent": "5+ strategic discovery questions, uncovers deep business needs, prospect shares genuine challenges",
                "good": "3-4 discovery questions, identifies key objectives, understands decision process",
                "fair": "1-2 basic questions, surface-level understanding, mostly makes assumptions",
                "poor": "No discovery questions, launches into pitch without understanding needs"
            }
        },
        {
            "name": "Value Proposition & Differentiation",
            "weight": 0.20,
            "description": "Clarity and relevance of the partnership value being offered",
            "criteria": [
                "Articulates unique inventory assets (venue signage, digital rights, player access, etc.)",
                "Connects offerings directly to prospect's stated objectives",
                "Differentiates from other sponsorship opportunities",
                "Quantifies reach, engagement, or audience demographics",
                "Positions as partnership (mutual benefit) vs. transactional sponsorship",
                "Provides specific activation examples relevant to prospect's industry"
            ],
            "evaluation_points": {
                "excellent": "Customized value prop tied to discovery, specific ROI examples, creative activation ideas",
                "good": "Clear value statements, some customization, mentions key assets",
                "fair": "Generic pitch about team/property, limited connection to prospect needs",
                "poor": "Vague benefits, no differentiation, reads like a script for any sponsor"
            }
        },
        {
            "name": "Business Acumen & Strategic Thinking",
            "weight": 0.15,
            "description": "Understanding of sponsor's business, market, and strategic context",
            "criteria": [
                "References prospect's industry trends or competitive landscape",
                "Understands how sponsorship fits into their broader marketing mix",
                "Speaks to business outcomes (sales lift, brand positioning, employee engagement) not just impressions",
                "Addresses potential concerns about ROI measurement proactively",
                "Demonstrates knowledge of typical sponsor objectives for their category"
            ],
            "evaluation_points": {
                "excellent": "Acts as strategic advisor, deep industry knowledge, frames partnership in business terms",
                "good": "Shows business understanding, discusses outcomes, professional framing",
                "fair": "Basic business awareness, focuses more on property features than outcomes",
                "poor": "No business context, focuses solely on sponsorship features/benefits"
            }
        },
        {
            "name": "Handling Objections & Challenges",
            "weight": 0.10,
            "description": "Response to prospect concerns, budget hesitations, or competitive alternatives",
            "criteria": [
                "Acknowledges objection without becoming defensive",
                "Asks clarifying questions to understand root concern",
                "Provides specific evidence or examples to address concern",
                "Offers flexible solutions or alternative approaches",
                "Maintains confidence while showing empathy"
            ],
            "evaluation_points": {
                "excellent": "Handles objections smoothly, reframes concerns, provides creative solutions",
                "good": "Addresses concerns directly, provides reasonable responses, stays composed",
                "fair": "Defensive or dismissive of concerns, weak responses",
                "poor": "Ignores objections, argues with prospect, or panics when challenged"
            }
        },
        {
            "name": "Call Structure & Flow",
            "weight": 0.10,
            "description": "Organization and pacing of the conversation",
            "criteria": [
                "Sets clear agenda at beginning of call",
                "Balances talking vs. listening (prospect speaks 40-60% of time)",
                "Logical progression from discovery to value prop to next steps",
                "Manages time effectively, stays on track",
                "Recaps key points and agreements throughout call"
            ],
            "evaluation_points": {
                "excellent": "Masterful flow, prospect-led discovery, smooth transitions, perfect pacing",
                "good": "Clear structure, good balance, stays mostly on track",
                "fair": "Somewhat disjointed, talks too much or too little, loses thread",
                "poor": "No structure, rambling, one-sided monologue"
            }
        },
        {
            "name": "Closing & Next Steps",
            "weight": 0.05,
            "description": "Effectiveness in advancing the deal and securing commitment",
            "criteria": [
                "Secures specific next action (meeting, proposal, introduction)",
                "Sets concrete dates/timelines for follow-up",
                "Confirms decision-makers who need to be involved",
                "Summarizes mutual interest and key takeaways",
                "Leaves prospect clear on what happens next"
            ],
            "evaluation_points": {
                "excellent": "Clear commitment secured, specific next steps with dates, prospect is excited",
                "good": "Next action defined, reasonable timeline, both parties aligned",
                "fair": "Vague next steps, no specific commitment, unclear timeline",
                "poor": "No close attempted, left hanging, prospect non-committal"
            }
        }
    ],
    
    "overall_scoring": {
        "90-100": {
            "grade": "A - Excellent",
            "description": "Partnership Pro: This was a masterful sales call. Clear discovery, customized value prop, and strong business acumen. Prospect is highly engaged and likely to advance."
        },
        "80-89": {
            "grade": "B - Strong",
            "description": "Solid Performer: A well-executed call with good rapport and discovery. Room for improvement in customization or strategic framing, but moving in the right direction."
        },
        "70-79": {
            "grade": "C - Competent",
            "description": "Getting There: Fundamentals are present but execution is inconsistent. More discovery needed, value prop could be sharper, or structure needs work."
        },
        "60-69": {
            "grade": "D - Needs Improvement",
            "description": "Work Required: Significant gaps in discovery, rapport, or value articulation. May have pitched too early or failed to connect to prospect's needs."
        },
        "0-59": {
            "grade": "F - Poor",
            "description": "Start Over: This call missed the fundamentals. Little to no discovery, generic pitch, or poor rapport. Unlikely to advance without major improvement."
        }
    },
    
    "additional_insights": [
        {
            "insight_type": "talk_ratio",
            "description": "Sales Rep vs. Prospect Speaking Time",
            "optimal": "40/60 to 50/50 - Partnership sales should be consultative, not pitch-heavy",
            "red_flag": "70/30 or worse - Rep is talking too much, not discovering enough"
        },
        {
            "insight_type": "question_quality",
            "description": "Discovery Question Analysis",
            "optimal": "5+ strategic open-ended questions about objectives, KPIs, decision process",
            "red_flag": "Only yes/no questions or less than 3 questions total"
        },
        {
            "insight_type": "activation_specificity",
            "description": "Partnership Activation Ideas",
            "optimal": "Specific, creative activation examples tailored to prospect's business",
            "red_flag": "Generic 'logo on jersey' talk with no customization"
        }
    ]
}

# Scoring weights must sum to 1.0
# Validate weights
assert sum([cat["weight"] for cat in SPORTS_PARTNERSHIP_RUBRIC["categories"]]) == 1.0, "Category weights must sum to 1.0"