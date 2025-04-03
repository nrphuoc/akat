export interface CommunityStandard {
  id: string;
  category: string;
  description: string;
  severity: 'veryhigh' | 'high' | 'medium' | 'low';
  examples: string[];
}

export const FACEBOOK_COMMUNITY_STANDARDS: CommunityStandard[] = [
  {
    id: 'hate_speech',
    category: 'Hate Speech',
    description: 'Content that attacks or discriminates against people based on protected characteristics',
    severity: 'veryhigh',
    examples: [
      'Racist slurs and discriminatory language',
      'Content promoting hate against religious groups',
      'Discriminatory content based on gender, sexual orientation, or disability'
    ]
  },
  {
    id: 'violence',
    category: 'Violence and Criminal Behavior',
    description: 'Content that promotes or glorifies violence',
    severity: 'high',
    examples: [
      'Graphic violence',
      'Threats of violence',
      'Content promoting terrorism'
    ]
  },
  {
    id: 'spam',
    category: 'Spam',
    description: 'Content that is repetitive, unwanted, or commercial in nature',
    severity: 'low',
    examples: [
      'Repeated posting of the same content',
      'Commercial content without proper disclosure',
      'Misleading or deceptive content'
    ]
  },
  {
    id: 'nudity',
    category: 'Adult Nudity and Sexual Activity',
    description: 'Content containing nudity or sexual activity',
    severity: 'high',
    examples: [
      'Explicit nudity',
      'Sexual content',
      'Adult content without proper age restrictions'
    ]
  },
  {
    id: 'bullying',
    category: 'Bullying and Harassment',
    description: 'Content that targets individuals with harassment or bullying',
    severity: 'high',
    examples: [
      'Personal attacks',
      'Cyberbullying',
      'Repeated harassment'
    ]
  }
]; 