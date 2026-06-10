export type WeeklyUpdateStatus = "draft" | "submitted" | "approved" | "rejected";

export interface WeeklyUpdateMetric {
  status: "green" | "amber" | "red";
  notes?: string;
}

export interface WeeklyUpdateRecord {
  id: string;
  projectName: string;
  weekNumber: number;
  weekDate: string;
  summary: string;
  status: WeeklyUpdateStatus;
  submittedBy?: string;
  submittedAt?: string;
  metrics?: Record<string, WeeklyUpdateMetric>;
  additionalNotes?: string;
  attachmentName?: string;
}

import { formatProjectWeekRange } from "./projectWeeks";

const TIMELINE_YEAR = 2026;

export const INITIAL_WEEKLY_UPDATES: WeeklyUpdateRecord[] = [
  {
    id: "wu-1",
    projectName: "Sumhuman",
    weekNumber: 23,
    weekDate: formatProjectWeekRange(23, TIMELINE_YEAR),
    summary: `Weekly Update - Week 23 (${formatProjectWeekRange(23, TIMELINE_YEAR)})

Key Accomplishments:
• Completed multi-tenancy database schema implementation
• Successfully deployed tenant isolation middleware
• Integrated authentication flow with role-based permissions

Progress: 85% complete, on schedule for Q2 delivery

Team Performance: All 8 team members submitted daily updates with 97% compliance

Next Week Focus:
• API endpoint testing and optimization
• Frontend integration for tenant management
• Security audit preparation`,
    status: "approved",
    submittedBy: "Manohar Ali",
    submittedAt: "Jun 7, 2026 at 5:30 PM",
    metrics: {
      schedule: { status: "green", notes: "All milestones completed on time." },
      delivery: { status: "green", notes: "Sprint deliverables completed successfully." },
      quality: { status: "amber", notes: "Unit test coverage at 78%. Targeting 85% next week." },
      financial: { status: "green", notes: "Within budget. No concerns." },
      budget: { status: "green", notes: "72% budget utilized with 85% work completed." },
    },
  },
  {
    id: "wu-2",
    projectName: "GTS — Global Trash System",
    weekNumber: 22,
    weekDate: formatProjectWeekRange(22, TIMELINE_YEAR),
    summary: `Weekly Update - Week 22 (${formatProjectWeekRange(22, TIMELINE_YEAR)})

Key Accomplishments:
• Route optimization module deployed to staging
• Map API integration completed for pilot cities

Progress: 92% complete, ahead of schedule

Blockers:
• Two blockers on map API rate limits — mitigation in progress

Next Week Focus:
• Production rollout planning
• Performance testing on route engine`,
    status: "submitted",
    submittedBy: "Aries Khan",
    submittedAt: "May 31, 2026 at 4:45 PM",
    metrics: {
      schedule: { status: "green", notes: "Ahead of planned timeline." },
      delivery: { status: "green", notes: "Staging deployment successful." },
      quality: { status: "green", notes: "QA sign-off received for core flows." },
      financial: { status: "green", notes: "On budget." },
      budget: { status: "amber", notes: "Map API costs slightly above forecast." },
    },
  },
  {
    id: "wu-3",
    projectName: "Bilingual Chatbot",
    weekNumber: 21,
    weekDate: formatProjectWeekRange(21, TIMELINE_YEAR),
    summary: `Weekly Update - Week 21 (${formatProjectWeekRange(21, TIMELINE_YEAR)})

Key Accomplishments:
• NLP pipeline tuning for Urdu/English code-switching
• Intent classification accuracy improved to 84%

Progress: 68% complete, quality metrics at risk

Next Week Focus:
• Expand test coverage for edge-case intents
• Review model latency under load`,
    status: "draft",
    submittedBy: "Uzair Ahmed",
    submittedAt: "May 25, 2026 at 6:00 PM",
    metrics: {
      schedule: { status: "amber", notes: "Slight delay on evaluation dataset cleanup." },
      delivery: { status: "amber", notes: "Pilot demo moved by one week." },
      quality: { status: "red", notes: "Test coverage below target due to dataset gaps." },
      financial: { status: "green", notes: "Spend within plan." },
      budget: { status: "green", notes: "No variance concerns." },
    },
  },
];

export function findWeeklyUpdate(
  projectName: string,
  weekNumber: number,
  updates: WeeklyUpdateRecord[] = INITIAL_WEEKLY_UPDATES,
): WeeklyUpdateRecord | undefined {
  return updates.find(
    (update) => update.projectName === projectName && update.weekNumber === weekNumber,
  );
}
