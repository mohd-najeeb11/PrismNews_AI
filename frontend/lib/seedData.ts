import { Story, QuotaStatus } from './types';

export const INITIAL_QUOTA: QuotaStatus = {
  api_mode: 'seed',
  newsapi_used: 5,
  newsapi_limit: 8,
  gemini_used: 12,
  gemini_limit: 20,
  groq_used: 2,
  groq_limit: 10,
  reset_time: '2026-08-08T00:00:00Z',
};

export const SEED_STORIES: Story[] = [
  {
    id: 'live-ee0ae502-0e9e-42ef-a7e8-32ee09bd62b6',
    title: 'Thailand school shooting: Pupil, 18, arrested after three killed',
    category: 'World News',
    created_at: '2026-08-07T19:44:00Z',
    updated_at: '2026-08-07T19:44:00Z',
    article_count: 6,
    sources_count: 5,
    dominant_bias: 'center',
    articles: [
      {
        id: 'art-bbc-1',
        source_id: 'bbc',
        source_name: 'BBC News',
        source_bias: 'center',
        title: 'Thailand school shooting: Pupil, 18, arrested after three killed',
        url: 'https://www.bbc.com/news/articles/c07rxz03034o',
        published_at: '2026-08-07T19:44:00Z',
        summary: 'An 18-year-old student was arrested following a fatal shooting at a school in Thailand that resulted in three deaths.',
        tone: 'neutral'
      },
      {
        id: 'art-cna-2',
        source_id: 'cna',
        source_name: 'Channel NewsAsia',
        source_bias: 'center',
        title: 'Thai Police Detain 18-Year-Old Suspect Following Campus Shooting Incident',
        url: 'https://channelnewsasia.com/asia/thai-school-shooting-suspect-arrested',
        published_at: '2026-08-07T19:40:00Z',
        summary: 'Local police in Thailand confirmed three casualties and reported ongoing security reviews.',
        tone: 'neutral'
      }
    ]
  },
  {
    id: 'story-ai-act-2026',
    title: 'Global AI Safety Legislation & Transparency Standards Framework Approved',
    category: 'Technology & Policy',
    created_at: '2026-08-07T08:30:00Z',
    updated_at: '2026-08-07T10:15:00Z',
    article_count: 6,
    sources_count: 5,
    dominant_bias: 'center',
    articles: [
      {
        id: 'art-1',
        source_id: 'reuters',
        source_name: 'Reuters',
        source_bias: 'center',
        title: 'Global Lawmakers Reach Landmark Consensus on AI Transparency Rules',
        url: 'https://reuters.com/technology/ai-transparency-rules-2026',
        author: 'Sarah Jenkins',
        published_at: '2026-08-07T08:30:00Z',
        summary: 'International negotiators agreed on mandatory source attribution and algorithmic audit standards for Frontier AI systems.',
        tone: 'neutral'
      },
      {
        id: 'art-2',
        source_id: 'wsj',
        source_name: 'The Wall Street Journal',
        source_bias: 'lean_right',
        title: 'New AI Framework Raises Compliance Burden for Tech Titans and Startups',
        url: 'https://wsj.com/tech/ai-framework-compliance-burdens',
        author: 'Michael Chang',
        published_at: '2026-08-07T09:00:00Z',
        summary: 'Industry leaders express concern that heavy-handed auditing mandates could impede startup innovation and slow capital investment.',
        tone: 'critical'
      },
      {
        id: 'art-3',
        source_id: 'guardian',
        source_name: 'The Guardian',
        source_bias: 'left',
        title: 'Victory for Public Interest as New AI Rules Target Synthetic Disinformation',
        url: 'https://theguardian.com/technology/ai-rules-disinformation-victory',
        author: 'Elena Rostova',
        published_at: '2026-08-07T09:15:00Z',
        summary: 'Civil liberty advocates praise new requirements for watermarking AI-generated media and exposing deepfake provenance.',
        tone: 'optimistic'
      },
      {
        id: 'art-4',
        source_id: 'foxnews',
        source_name: 'Fox News',
        source_bias: 'right',
        title: 'Global Bureaucracy Threatens American AI Lead with Sweeping New Restrictions',
        url: 'https://foxnews.com/tech/global-bureaucracy-ai-restrictions',
        author: 'David Vance',
        published_at: '2026-08-07T09:45:00Z',
        summary: 'Critics warn foreign regulatory bodies are imposing unilateral constraints that disproportionately target US technological leadership.',
        tone: 'alarmist'
      },
      {
        id: 'art-5',
        source_id: 'npr',
        source_name: 'NPR',
        source_bias: 'lean_left',
        title: 'What the New AI Framework Means for Everyday Media Consumers',
        url: 'https://npr.org/sections/tech/2026/08/ai-framework-explained',
        author: 'Aisha Patel',
        published_at: '2026-08-07T10:00:00Z',
        summary: 'An overview of how mandatory bias labeling and content disclosure will appear across digital news feeds and social platforms.',
        tone: 'neutral'
      }
    ],
    analysis: {
      story_id: 'story-ai-act-2026',
      analyzed_at: '2026-08-07T10:20:00Z',
      balanced_summary: {
        overview: 'Global regulatory bodies have formally adopted the 2026 International AI Transparency Framework. The accord establishes mandatory source watermarking, open auditing standards for frontier models, and clear legal disclosure requirements for synthetic content.',
        consensus_points: [
          'All reporting confirms international consensus was reached on mandatory labeling for AI synthetic media.',
          'Frontier model developers will undergo independent safety audits prior to broad public release.',
          'Implementation will roll out in phases over the next 18 months across participating jurisdictions.'
        ],
        disputed_points: [
          'Left-leaning & public-interest outlets view the measure as a critical triumph against disinformation, while right-leaning outlets portray it as regulatory overreach.',
          'Business outlets stress potential financial compliance strains on early-stage startups, whereas tech-focused outlets emphasize long-term market stability.'
        ],
        key_takeaway: 'While the core technical disclosure standards are universally acknowledged, coverage diverges sharply on whether the framework safeguards democratic integrity or stifles free-market technological innovation.'
      },
      comparison: [
        {
          outlet_name: 'Reuters',
          bias_rating: 'center',
          article_title: 'Global Lawmakers Reach Landmark Consensus on AI Transparency Rules',
          article_url: 'https://reuters.com/technology/ai-transparency-rules-2026',
          framing_summary: 'Focuses strictly on international agreement terms, timeline, and procedural voting results.',
          tone: 'neutral',
          key_quotes: [
            'Delegates from 42 nations ratified the accord following nine months of multi-stakeholder negotiation.',
            'The framework establishes uniform protocols for digital media provenance.'
          ]
        },
        {
          outlet_name: 'The Guardian',
          bias_rating: 'left',
          article_title: 'Victory for Public Interest as New AI Rules Target Synthetic Disinformation',
          article_url: 'https://theguardian.com/technology/ai-rules-disinformation-victory',
          framing_summary: 'Frames the policy as an urgent victory for democratic institutions against corporate malfeasance.',
          tone: 'optimistic',
          key_quotes: [
            'Advocates hailed the decision as a decisive check on unchecked algorithmic exploitation.',
            'Disinformation researchers welcomed mandatory watermark tracing for electoral integrity.'
          ]
        },
        {
          outlet_name: 'The Wall Street Journal',
          bias_rating: 'lean_right',
          article_title: 'New AI Framework Raises Compliance Burden for Tech Titans and Startups',
          article_url: 'https://wsj.com/tech/ai-framework-compliance-burdens',
          framing_summary: 'Highlights financial impact, venture capital hesitation, and compliance costs.',
          tone: 'critical',
          key_quotes: [
            'Venture capitalists caution that legal liability clauses could freeze seed-stage AI funding.',
            'Enterprise tech firms estimate compliance overhead could add 15% to model operational costs.'
          ]
        },
        {
          outlet_name: 'Fox News',
          bias_rating: 'right',
          article_title: 'Global Bureaucracy Threatens American AI Lead with Sweeping New Restrictions',
          article_url: 'https://foxnews.com/tech/global-bureaucracy-ai-restrictions',
          framing_summary: 'Emphasizes national sovereignty, global competitiveness, and federal overreach.',
          tone: 'alarmist',
          key_quotes: [
            'Foreign bureaucrats are dictating terms that shackle domestic tech innovation.',
            'Critics argue the rules put Western firms at a disadvantage against unconstrained foreign rivals.'
          ]
        }
      ],
      bias_analysis: {
        spectrum_score: 0.05,
        dominant_framing: 'Balanced coverage with noticeable ideological divergence between public safety vs. market innovation.',
        loaded_phrases: [
          {
            phrase: 'Global bureaucracy shackling domestic tech',
            outlet: 'Fox News',
            bias: 'right',
            reason: 'Employs emotive, combative language ("shackling", "bureaucracy") to evoke hostility toward international standard-setting.',
            neutral_alternative: 'International regulatory framework setting industry requirements'
          },
          {
            phrase: 'Decisive check on unchecked algorithmic exploitation',
            outlet: 'The Guardian',
            bias: 'left',
            reason: 'Uses value-laden framing ("exploitation", "unchecked") assuming malicious intent prior to regulatory action.',
            neutral_alternative: 'New compliance requirements for commercial AI models'
          },
          {
            phrase: 'Heavy-handed auditing mandates',
            outlet: 'The Wall Street Journal',
            bias: 'lean_right',
            reason: 'Presents regulatory compliance in inherently negative terms ("heavy-handed") rather than neutral terms.',
            neutral_alternative: 'Comprehensive audit requirements'
          }
        ],
        source_bias_distribution: {
          left: 1,
          lean_left: 1,
          center: 1,
          lean_right: 1,
          right: 1
        }
      },
      missing_perspectives: [
        {
          angle: 'Open-Source Developer & Small Business Impact',
          description: 'Coverage focuses almost exclusively on multi-billion dollar tech giants and state actors, leaving out independent open-source developers.',
          why_it_matters: 'Independent developers often lack legal compliance teams and could be inadvertently squeezed out of model distribution.',
          missing_from_outlets: ['Fox News', 'Reuters', 'The Wall Street Journal']
        },
        {
          angle: 'Global South & Developing World Perspectives',
          description: 'No major outlet analyzed how non-Western developing nations will enforce or adapt these international standards without dedicated computing infrastructure.',
          why_it_matters: 'Enforcement disparity could lead to global digital divides where safety checks exist only in high-income regions.',
          missing_from_outlets: ['The Guardian', 'NPR', 'The Wall Street Journal', 'Fox News', 'Reuters']
        }
      ],
      timeline: [
        {
          timestamp: '2026-08-07 08:30',
          outlet: 'Reuters',
          headline: 'Delegates convene in Geneva for final draft vote',
          framing_shift: 'Procedural focus on agreement milestones.'
        },
        {
          timestamp: '2026-08-07 09:15',
          outlet: 'The Guardian',
          headline: 'Civil society coalitions hail landmark safety victory',
          framing_shift: 'Shifted focus to public health and disinformation prevention.'
        },
        {
          timestamp: '2026-08-07 09:45',
          outlet: 'Fox News',
          headline: 'Industry analysts raise alarm over foreign regulatory power',
          framing_shift: 'Shifted debate to national economic competition and sovereignty.'
        },
        {
          timestamp: '2026-08-07 10:15',
          outlet: 'NPR',
          headline: 'Consumer guide released on how AI labels will work',
          framing_shift: 'Refocused on end-user practical impacts.'
        }
      ]
    }
  },
  {
    id: 'story-fed-rates-2026',
    title: 'Central Banks Hold Interest Rates Steady Amid Mixed Inflation Signals',
    category: 'Economy & Markets',
    created_at: '2026-08-06T14:00:00Z',
    updated_at: '2026-08-06T18:00:00Z',
    article_count: 5,
    sources_count: 4,
    dominant_bias: 'center',
    articles: [
      {
        id: 'art-fed-1',
        source_id: 'bloomberg',
        source_name: 'Bloomberg',
        source_bias: 'center',
        title: 'Federal Reserve Holds Benchmark Rate at 4.25% in Unanimous Decision',
        url: 'https://bloomberg.com/news/fed-holds-rates-2026',
        published_at: '2026-08-06T14:00:00Z',
        tone: 'neutral'
      },
      {
        id: 'art-fed-2',
        source_id: 'ft',
        source_name: 'Financial Times',
        source_bias: 'center',
        title: 'Central Banks Navigate Tightrope Between Inflation Control and Growth',
        url: 'https://ft.com/content/central-banks-tightrope',
        published_at: '2026-08-06T15:00:00Z',
        tone: 'neutral'
      },
      {
        id: 'art-fed-3',
        source_id: 'cnbc',
        source_name: 'CNBC',
        source_bias: 'lean_right',
        title: 'Markets Rally as Fed Signals Potential Rate Cut Before Year-End',
        url: 'https://cnbc.com/economy/fed-rate-decision-market-reaction',
        published_at: '2026-08-06T15:30:00Z',
        tone: 'optimistic'
      }
    ],
    analysis: {
      story_id: 'story-fed-rates-2026',
      analyzed_at: '2026-08-06T18:30:00Z',
      balanced_summary: {
        overview: 'The Federal Reserve unanimously voted to maintain interest rates at current levels, citing ongoing progress on core inflation balanced against resilient labor markets.',
        consensus_points: [
          'Interest rates remain unchanged at 4.25%.',
          'The decision was reached unanimously by voting FOMC members.',
          'Inflation is slowing but remains slightly above the target 2% threshold.'
        ],
        disputed_points: [
          'Financial outlets interpret the Fed chair statement as dovish, signaling imminent cuts, while macro economists warn rate cuts could be delayed into 2027.'
        ],
        key_takeaway: 'Financial markets responded positively to hints of future monetary easing, though overall economic indicators remain mixed.'
      },
      comparison: [
        {
          outlet_name: 'Bloomberg',
          bias_rating: 'center',
          article_title: 'Federal Reserve Holds Benchmark Rate at 4.25% in Unanimous Decision',
          article_url: 'https://bloomberg.com/news/fed-holds-rates-2026',
          framing_summary: 'Focuses on precise economic data and FOMC statement breakdown.',
          tone: 'neutral',
          key_quotes: [
            'The committee noted sustained moderation in wage growth while keeping options open.'
          ]
        },
        {
          outlet_name: 'CNBC',
          bias_rating: 'lean_right',
          article_title: 'Markets Rally as Fed Signals Potential Rate Cut Before Year-End',
          article_url: 'https://cnbc.com/economy/fed-rate-decision-market-reaction',
          framing_summary: 'Emphasizes stock index gains and investor optimism.',
          tone: 'optimistic',
          key_quotes: [
            'Wall Street surged following comments interpreted as paving the way for monetary relief.'
          ]
        }
      ],
      bias_analysis: {
        spectrum_score: 0.0,
        dominant_framing: 'Balanced financial reporting with market-bullish leaning on investor networks.',
        loaded_phrases: [
          {
            phrase: 'Paving the way for monetary relief',
            outlet: 'CNBC',
            bias: 'lean_right',
            reason: 'Frames lower interest rates as inherently positive "relief" for markets.',
            neutral_alternative: 'Indicating potential future rate adjustments'
          }
        ],
        source_bias_distribution: {
          left: 0,
          lean_left: 1,
          center: 2,
          lean_right: 1,
          right: 0
        }
      },
      missing_perspectives: [
        {
          angle: 'Housing Affordability & First-Time Buyers',
          description: 'Financial coverage centered on S&P 500 movement rather than consumer mortgage rate relief.',
          why_it_matters: 'Sustained 4.25% policy rates keep average 30-year fixed mortgages elevated above 6.5%.',
          missing_from_outlets: ['Bloomberg', 'CNBC', 'Financial Times']
        }
      ],
      timeline: [
        {
          timestamp: '2026-08-06 14:00',
          outlet: 'Bloomberg',
          headline: 'FOMC statement released',
          framing_shift: 'Data-driven report on rate hold.'
        },
        {
          timestamp: '2026-08-06 15:30',
          outlet: 'CNBC',
          headline: 'Post-conference market rally begins',
          framing_shift: 'Optimistic market framing.'
        }
      ]
    }
  },
  {
    id: 'story-clean-energy-2026',
    title: 'National Clean Energy Grid Upgrade Initiative Sparked Regional Debates',
    category: 'Energy & Environment',
    created_at: '2026-08-05T10:00:00Z',
    updated_at: '2026-08-05T16:00:00Z',
    article_count: 4,
    sources_count: 4,
    dominant_bias: 'lean_left',
    articles: [
      {
        id: 'art-grid-1',
        source_id: 'washpost',
        source_name: 'The Washington Post',
        source_bias: 'lean_left',
        title: '$50 Billion Modernization Grid Project Acceleration Announced',
        url: 'https://washingtonpost.com/climate/grid-modernization-2026',
        published_at: '2026-08-05T10:00:00Z',
        tone: 'optimistic'
      },
      {
        id: 'art-grid-2',
        source_id: 'politico',
        source_name: 'Politico',
        source_bias: 'center',
        title: 'Transmission Permitting Battles Heat Up in Western States',
        url: 'https://politico.com/energy/transmission-permitting-battles',
        published_at: '2026-08-05T12:00:00Z',
        tone: 'neutral'
      }
    ],
    analysis: {
      story_id: 'story-clean-energy-2026',
      analyzed_at: '2026-08-05T16:30:00Z',
      balanced_summary: {
        overview: 'A major infrastructure initiative targeting high-voltage renewable transmission lines has entered implementation, triggering jurisdictional debates between federal energy regulators and local landowners.',
        consensus_points: [
          'Federal funding of $50B has been allocated for power grid modernization.',
          'The goal is connecting remote solar and wind hubs to urban population centers.'
        ],
        disputed_points: [
          'Environmental outlets champion emissions reductions; local agricultural groups voice property rights concerns over land eminent domain.'
        ],
        key_takeaway: 'Grid modernization enjoys broad national decarbonization support, but local permitting and land-use disputes threaten project timelines.'
      },
      comparison: [
        {
          outlet_name: 'The Washington Post',
          bias_rating: 'lean_left',
          article_title: '$50 Billion Modernization Grid Project Acceleration Announced',
          article_url: 'https://washingtonpost.com/climate/grid-modernization-2026',
          framing_summary: 'Focuses on carbon reduction goals and climate resilience.',
          tone: 'optimistic',
          key_quotes: ['Essential step toward 100% clean power reliability.']
        },
        {
          outlet_name: 'Politico',
          bias_rating: 'center',
          article_title: 'Transmission Permitting Battles Heat Up in Western States',
          article_url: 'https://politico.com/energy/transmission-permitting-battles',
          framing_summary: 'Analyzes legislative maneuvering and state governor pushbacks.',
          tone: 'neutral',
          key_quotes: ['State officials balk at federal preemptive right-of-way powers.']
        }
      ],
      bias_analysis: {
        spectrum_score: -0.2,
        dominant_framing: 'Pro-climate transition framing with emerging local governance conflict highlights.',
        loaded_phrases: [
          {
            phrase: 'Essential step toward grid survival',
            outlet: 'The Washington Post',
            bias: 'lean_left',
            reason: 'Framed as an existential necessity rather than one policy option among many.',
            neutral_alternative: 'Infrastructure upgrade project aimed at capacity'
          }
        ],
        source_bias_distribution: {
          left: 1,
          lean_left: 2,
          center: 1,
          lean_right: 0,
          right: 0
        }
      },
      missing_perspectives: [
        {
          angle: 'Electricity Consumer Utility Rate Impact',
          description: 'Few articles calculate short-term rate hikes for residential consumers to fund capital builds.',
          why_it_matters: 'Utility bills may increase before long-term savings materialize.',
          missing_from_outlets: ['The Washington Post', 'Politico']
        }
      ],
      timeline: [
        {
          timestamp: '2026-08-05 10:00',
          outlet: 'The Washington Post',
          headline: 'Grant allocation announcement',
          framing_shift: 'National climate focus.'
        }
      ]
    }
  },
  {
    id: 'story-tech-antitrust-2026',
    title: 'Tech Monopoly Antitrust Ruling Orders Open Platform & Ecosystem Interoperability',
    category: 'Technology & Policy',
    created_at: '2026-08-06T16:20:00Z',
    updated_at: '2026-08-07T05:10:00Z',
    article_count: 4,
    sources_count: 4,
    dominant_bias: 'center',
    articles: [
      {
        id: 'art-anti-1',
        source_id: 'nytimes',
        source_name: 'The New York Times',
        source_bias: 'lean_left',
        title: 'Federal Judge Issues Sweeping Interoperability Mandate in Big Tech Lawsuit',
        url: 'https://nytimes.com/tech/antitrust-ruling-interoperability-2026',
        published_at: '2026-08-06T16:20:00Z',
        summary: 'A federal court ruled that dominant app store operators must allow un-throttled third-party payment engines.',
        tone: 'neutral'
      }
    ]
  },
  {
    id: 'story-space-artemis-2026',
    title: 'International Lunar Outpost Mission Achieves Historic Landing Benchmark',
    category: 'World News',
    created_at: '2026-08-06T14:10:00Z',
    updated_at: '2026-08-07T04:00:00Z',
    article_count: 5,
    sources_count: 4,
    dominant_bias: 'center',
    articles: [
      {
        id: 'art-space-1',
        source_id: 'ap',
        source_name: 'Associated Press',
        source_bias: 'center',
        title: 'Joint International Lunar Module Successfully Touches Down at South Pole',
        url: 'https://apnews.com/science/lunar-landing-artemis-2026',
        published_at: '2026-08-06T14:10:00Z',
        summary: 'Astronauts established the baseline infrastructure for a permanent scientific base.',
        tone: 'neutral'
      }
    ]
  },
  {
    id: 'story-cyber-infrastructure-2026',
    title: 'Critical National Infrastructure Cyber Defense Accord Signed by Allied Nations',
    category: 'Technology & Policy',
    created_at: '2026-08-06T11:00:00Z',
    updated_at: '2026-08-07T02:00:00Z',
    article_count: 4,
    sources_count: 4,
    dominant_bias: 'lean_right',
    articles: [
      {
        id: 'art-cyber-1',
        source_id: 'reuters',
        source_name: 'Reuters',
        source_bias: 'center',
        title: 'Allied Defense Ministers Form Joint Cyber Threat Rapid Response Network',
        url: 'https://reuters.com/world/cyber-threat-rapid-response-2026',
        published_at: '2026-08-06T11:00:00Z',
        summary: 'A new intelligence-sharing pact mandates real-time telemetry sharing to defend power grids.',
        tone: 'neutral'
      }
    ]
  },
  {
    id: 'story-biotech-gene-2026',
    title: 'Breakthrough In-Vivo Gene Therapy Receives Multinational Health Approval',
    category: 'World News',
    created_at: '2026-08-06T09:30:00Z',
    updated_at: '2026-08-06T23:00:00Z',
    article_count: 4,
    sources_count: 4,
    dominant_bias: 'left',
    articles: [
      {
        id: 'art-bio-1',
        source_id: 'guardian',
        source_name: 'The Guardian',
        source_bias: 'left',
        title: 'Single-Dose CRISPR Therapy Approved for Rare Genetic Cardiac Disorders',
        url: 'https://theguardian.com/science/crispr-therapy-approval-2026',
        published_at: '2026-08-06T09:30:00Z',
        summary: 'Health regulators cleared a precision gene therapy that permanently corrects inherited cardiac mutations.',
        tone: 'optimistic'
      }
    ]
  },
  {
    id: 'story-global-trade-2026',
    title: 'Multilateral Supply Chain Resiliency & Critical Minerals Trade Pact Ratified',
    category: 'Economy & Markets',
    created_at: '2026-08-06T08:00:00Z',
    updated_at: '2026-08-06T21:00:00Z',
    article_count: 5,
    sources_count: 4,
    dominant_bias: 'center',
    articles: [
      {
        id: 'art-trade-1',
        source_id: 'ft',
        source_name: 'Financial Times',
        source_bias: 'center',
        title: 'Pacific Rim Nations Sign Strategic Critical Minerals Processing Partnership',
        url: 'https://ft.com/content/critical-minerals-trade-pact-2026',
        published_at: '2026-08-06T08:00:00Z',
        summary: 'Member countries established reduced tariffs and mutual stockpiling guarantees for rare earths.',
        tone: 'neutral'
      }
    ]
  },
  {
    id: 'story-quantum-breakthrough-2026',
    title: 'Post-Quantum Encryption Standard Adopted Across International Banking Networks',
    category: 'Technology & Policy',
    created_at: '2026-08-06T06:15:00Z',
    updated_at: '2026-08-06T18:00:00Z',
    article_count: 4,
    sources_count: 4,
    dominant_bias: 'center',
    articles: [
      {
        id: 'art-quant-1',
        source_id: 'bloomberg',
        source_name: 'Bloomberg',
        source_bias: 'center',
        title: 'Global Banking Consortium Migrates Core Settlement Systems to Quantum-Safe Cryptography',
        url: 'https://bloomberg.com/tech/post-quantum-banking-migration',
        published_at: '2026-08-06T06:15:00Z',
        summary: 'Financial institutions finalized deployment of lattice-based encryption algorithms.',
        tone: 'neutral'
      }
    ]
  },
  {
    id: 'story-climate-cop31-2026',
    title: 'COP31 Climate Accord Reaches Binding Loss and Damage Infrastructure Pact',
    category: 'Energy & Environment',
    created_at: '2026-08-05T20:00:00Z',
    updated_at: '2026-08-06T16:00:00Z',
    article_count: 5,
    sources_count: 4,
    dominant_bias: 'left',
    articles: [
      {
        id: 'art-cop-1',
        source_id: 'guardian',
        source_name: 'The Guardian',
        source_bias: 'left',
        title: 'Developing Nations Secure $100B Resilience Fund at COP31 Summit',
        url: 'https://theguardian.com/environment/cop31-resilience-fund-deal',
        published_at: '2026-08-05T20:00:00Z',
        summary: 'Delegates approved an operational facility providing direct grant financing for climate adaptation.',
        tone: 'optimistic'
      }
    ]
  }
];
