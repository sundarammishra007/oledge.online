export interface Project {
  title: string;
  description: string;
  link?: string;
  technologies?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  certificateUrl?: string;
  certificateData?: string; // base64
  taggedEntityId?: string; // ID of the company/college/govt user
  taggedEntityName?: string;
  taggedEntityType?: 'company' | 'college' | 'govt';
  isVerifiedByEntity?: boolean;
}

export interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

export interface VolunteerExperience {
  role: string;
  organization: string;
  description: string;
  startDate: string;
  endDate?: string;
}

export interface ThemeSettings {
  accentColor: string;
  backgroundType: 'solid' | 'gradient' | 'pattern' | 'image';
  backgroundValue: string;
  darkMode: boolean;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  backgroundURL?: string;
  mobileNo?: string;
  role: 'student' | 'govt' | 'college' | 'company' | 'admin';
  college?: string;
  branch?: string;
  skills?: string[];
  resumeUrl?: string;
  portfolioLinks?: string[];
  interests?: string[];
  isVerified?: boolean;
  referralCount?: number;
  isCampusAmbassador?: boolean;
  createdAt?: string;
  followers?: string[];
  following?: string[];
  friends?: string[]; // array of userIds
  projects?: Project[];
  certifications?: Certification[];
  volunteerExperience?: VolunteerExperience[];
  summary?: string;
  education?: Education[];
  themeSettings?: ThemeSettings;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Seminar {
  id: string;
  title: string;
  type: 'seminar' | 'webinar';
  organizer: string;
  organizerId: string;
  date: string;
  time: string;
  location: string; // or link for webinar
  description: string;
  registrationUrl?: string;
  createdAt: string;
}

export interface Apprenticeship {
  id: string;
  title: string;
  organizer: string;
  organizerId: string;
  organizerRole: 'govt' | 'company' | 'college';
  location: string;
  duration: string;
  stipend?: string;
  description: string;
  skillsRequired: string[];
  deadline: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'govt' | 'college' | 'company' | 'admin' | 'student';
  type?: 'official' | 'achievement';
  reactions: {
    acknowledge: string[]; // array of userIds
    inspiring: string[];
    useful: string[];
  };
  reposts: string[]; // array of userIds who reposted
  commentsCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  noticeId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Internship {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  location: string;
  isRemote: boolean;
  stipend: string;
  description: string;
  skillsRequired: string[];
  deadline: string;
  createdAt: string;
}

export interface Hackathon {
  id: string;
  eventName: string;
  organizer: string;
  organizerId: string;
  description: string;
  deadline: string;
  applyUrl: string;
  createdAt: string;
}

export interface JobFair {
  id: string;
  title: string;
  location: string;
  date: string;
  organizer: string;
  organizerId: string;
  companies: string[];
  createdAt: string;
}

export interface FreelanceProject {
  id: string;
  title: string;
  budget: string;
  deadline: string;
  description: string;
  skillsRequired: string[];
  creatorId: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisherId: string;
  description: string;
  category: string;
  fileUrl?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'academic' | 'exam' | 'holiday' | 'event';
  creatorId: string;
  creatorRole: string;
  description: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  type: 'blog' | 'question';
  tags: string[];
  upvotes: string[]; // array of userIds
  downvotes: string[]; // array of userIds
  viewsCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  upvotes: string[]; // array of userIds
  isCorrectAnswer?: boolean; // for questions
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  organizerId: string;
  category: 'award_ceremony' | 'farewell' | 'annual_function' | 'national_event' | 'international_event' | 'celebration';
  image?: string;
  registrationUrl?: string;
  createdAt: string;
}
