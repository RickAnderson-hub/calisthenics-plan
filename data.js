/* Source: Rick_6-Month_Calisthenics_Plan.pdf (prepared 2026-09-06)
   Structured transcription — do not add exercises/numbers not present in the PDF. */

const WEEKLY_SCHEDULE = [
  { day: 'Tuesday', session: 'Strength A', focus: 'Upper body + squat + core' },
  { day: 'Wednesday', session: 'Conditioning / mobility', focus: 'Walking + mobility + easy core' },
  { day: 'Saturday', session: 'Strength B', focus: 'Hinge + upper body + legs + core' },
  { day: 'Sunday', session: 'Easy conditioning', focus: 'Long walk + optional short calisthenics circuit' },
];

const WALKING_PROGRESSION_NOTE = "Wednesday and Sunday remain predominantly walking.";

const PLAN_DATA = {
  meta: {
    title: '6-Month Calisthenics & Strength Plan',
    subtitle: 'Prepared for Rick — a joint-friendly, progressive path from a strong foundation to real calisthenics strength, built alongside steady, sustainable fat loss.',
    stats: { age: 54, startWeight: '127 kg', weeks: 24, trainingDaysPerWeek: 4 },
    prepared: '2026-09-06',
  },

  overview: {
    intro: [
      "The first priority is building a strong, sustainable base without beating up your joints — then progressively moving toward harder calisthenics.",
      "A good target is 4 training days, but only 2–3 need to be genuinely hard. The other sessions are technique, walking, mobility, and conditioning. Adults are generally advised to get at least 150 minutes of moderate activity plus muscle-strengthening work on 2+ days per week, and gradual weight loss tends to be more sustainable than aggressive loss.",
      "The biggest mistake to avoid is jumping straight into \"hardcore calisthenics.\" At your current bodyweight, exercises such as conventional push-ups, dips, and pull-ups are considerably more demanding than they are for a lighter beginner — so we'll use inclines, assistance, and controlled tempo instead.",
      "Two proper strength days separated by several days is a very sensible starting point — ACSM guidance also supports at least two strength sessions per week.",
    ],
    caveat: "Because you're starting at 127 kg, get medical clearance before doing vigorous or high-impact exercise — particularly if you've been relatively inactive or have cardiovascular, joint, diabetes, or other chronic issues.",
  },

  phases: [
    {
      id: 1,
      name: 'Foundation',
      weekRange: [1, 4],
      goal: 'Learn movements, build work capacity',
      intro: "The objective isn't exhaustion. It's teaching your body to train.",
      days: {
        tuesday: {
          title: 'Strength A',
          warmup: '8–10 min easy walking + joint movements.',
          exercises: [
            { name: 'Chair squat', sets: 3, reps: '8–12' },
            { name: 'Incline push-up', sets: 3, reps: '6–12' },
            { name: 'Band/cable row', sets: 3, reps: '8–12' },
            { name: 'Glute bridge', sets: 3, reps: '10–15' },
            { name: 'Standing band shoulder press', sets: 2, reps: '8–12' },
            { name: 'Dead bug', sets: 3, reps: '6–10/side' },
          ],
          note: 'Rest 60–120 sec between sets.',
        },
        wednesday: {
          title: 'Conditioning',
          walk: '30–40 min brisk walking, then easy mobility work:',
          mobility: [
            'Ankle mobility × 10/side',
            'Hip mobility × 10',
            'Shoulder circles × 10',
            'Bird dog × 8/side',
          ],
          note: 'Keep this easy.',
        },
        saturday: {
          title: 'Strength B',
          exercises: [
            { name: 'Box/chair squat', sets: 3, reps: '8–12' },
            { name: 'Incline push-up', sets: 3, reps: '6–12' },
            { name: 'Band row', sets: 3, reps: '8–12' },
            { name: 'Romanian deadlift (DB/band)', sets: 3, reps: '8–12' },
            { name: 'Step-up to low step', sets: 2, reps: '6–10/leg' },
            { name: 'Farmer carry', sets: 3, reps: '20–40 m' },
            { name: 'Plank against bench/wall', sets: 3, reps: '20–30 sec' },
          ],
        },
        sunday: {
          title: 'Easy Conditioning',
          walk: '40–60 min at a comfortable/brisk pace.',
          optional: 'Optional — 2 rounds: chair squat × 10, incline push-up × 8, band row × 10, glute bridge × 12.',
          note: "Don't turn Sunday into another hard workout.",
        },
      },
    },
    {
      id: 2,
      name: 'Base strength',
      weekRange: [5, 8],
      goal: 'Increase reps and reduce assistance',
      intro: 'Now we start making the exercises harder.',
      days: {
        tuesday: {
          title: 'Tuesday',
          exercises: [
            { name: 'Squat to lower box', sets: 3, reps: '8–12' },
            { name: 'Incline push-up', sets: 3, reps: '8–12' },
            { name: 'Band row', sets: 4, reps: '8–12' },
            { name: 'Romanian deadlift', sets: 3, reps: '10' },
            { name: 'Split squat holding support', sets: 2, reps: '6–10/leg' },
            { name: 'Dead bug', sets: 3, reps: '8–12/side' },
          ],
        },
        saturday: {
          title: 'Saturday',
          exercises: [
            { name: 'Goblet squat', sets: 3, reps: '8–12' },
            { name: 'Incline push-up', sets: 4, reps: '6–12' },
            { name: 'One-arm row', sets: 3, reps: '8–12/side' },
            { name: 'Glute bridge / hip thrust', sets: 3, reps: '10–15' },
            { name: 'Step-up', sets: 3, reps: '8/leg' },
            { name: 'Farmer carry', sets: 4, reps: '30–45 m' },
          ],
          note: 'Start reducing the height of your push-up surface as you get stronger.',
        },
        wednesday: { title: 'Conditioning', generic: true },
        sunday: { title: 'Easy Conditioning', generic: true },
      },
    },
    {
      id: 3,
      name: 'Strength',
      weekRange: [9, 12],
      goal: 'Harder variations, lower reps',
      intro: 'We\'re now transitioning from "exercise" to strength training. Use approximately 6–10 good reps rather than chasing huge rep counts.',
      days: {
        tuesday: {
          title: 'Tuesday',
          hasPairs: true,
          exercises: [
            { pair: 'A1', name: 'Goblet squat', sets: 4, reps: '6–10' },
            { pair: 'A2', name: 'Incline / bench push-up', sets: 4, reps: '6–10' },
            { pair: 'B1', name: 'Band/cable row', sets: 4, reps: '6–10' },
            { pair: 'B2', name: 'Romanian deadlift', sets: 4, reps: '6–10' },
            { pair: 'C1', name: 'Supported split squat', sets: 3, reps: '6–8/leg' },
            { pair: 'C2', name: 'Dead bug', sets: 3, reps: '8/side' },
          ],
        },
        saturday: {
          title: 'Saturday',
          exercises: [
            { name: 'Goblet squat', sets: 4, reps: '6–10' },
            { name: 'Push-up variation', sets: 4, reps: '6–10' },
            { name: 'One-arm row', sets: 4, reps: '8/side' },
            { name: 'Hip thrust', sets: 3, reps: '8–12' },
            { name: 'Step-up', sets: 3, reps: '8/leg' },
            { name: 'Farmer carry', sets: 4, reps: '40 m' },
          ],
          note: 'At this point, you should be noticeably stronger.',
        },
        wednesday: { title: 'Conditioning', generic: true },
        sunday: { title: 'Easy Conditioning', generic: true },
      },
    },
    {
      id: 4,
      name: 'Progressive strength',
      weekRange: [13, 16],
      goal: 'Add resistance/tempo',
      intro: 'Start introducing harder calisthenics variations.',
      days: {
        tuesday: {
          title: 'Tuesday',
          exercises: [
            { name: 'Goblet squat', sets: 4, reps: '6–8' },
            { name: 'Push-up', sets: 4, reps: '5–10' },
            { name: 'Inverted row', sets: 4, reps: '5–10' },
            { name: 'Romanian deadlift', sets: 4, reps: '6–8' },
            { name: 'Split squat', sets: 3, reps: '6–8/leg' },
            { name: 'Plank', sets: 3, reps: '30–45 sec' },
          ],
        },
        saturday: {
          title: 'Saturday',
          exercises: [
            { name: 'Box squat / goblet squat', sets: 4, reps: '6–8' },
            { name: 'Push-up', sets: 4, reps: '5–10' },
            { name: 'Inverted row', sets: 4, reps: '6–10' },
            { name: 'Hip thrust', sets: 4, reps: '8–12' },
            { name: 'Step-up', sets: 3, reps: '8/leg' },
            { name: 'Suitcase carry', sets: 3, reps: '30 m/side' },
          ],
        },
        wednesday: { title: 'Conditioning', generic: true },
        sunday: { title: 'Easy Conditioning', generic: true },
        goal: "Start moving from elevated push-ups toward floor push-ups. For pulling, an inverted row is much more realistic initially than jumping straight to pull-ups.",
      },
    },
    {
      id: 5,
      name: 'Calisthenics strength',
      weekRange: [17, 20],
      goal: 'Stronger push/pull/legs',
      intro: 'Now we start explicitly training toward classic calisthenics movements.',
      days: {
        tuesday: {
          title: 'Tuesday',
          exercises: [
            { name: 'Goblet squat', sets: 4, reps: '5–8' },
            { name: 'Push-up', sets: 4, reps: '5–10' },
            { name: 'Inverted row', sets: 4, reps: '5–10' },
            { name: 'Bulgarian split squat', sets: 3, reps: '6–8' },
            { name: 'Romanian deadlift', sets: 3, reps: '6–8' },
            { name: 'Plank', sets: 3, reps: '40–60 sec' },
          ],
        },
        saturday: {
          title: 'Saturday',
          exercises: [
            { name: 'Squat variation', sets: 4, reps: '5–8' },
            { name: 'Push-up variation', sets: 4, reps: '5–10' },
            { name: 'Assisted pull-up / pulldown', sets: 4, reps: '5–8' },
            { name: 'Hip thrust', sets: 3, reps: '8–10' },
            { name: 'Step-up', sets: 3, reps: '8/leg' },
            { name: 'Farmer carry', sets: 4, reps: '40–60 m' },
          ],
          note: 'The assisted pull-up is where you should progress toward your first unassisted pull-up.',
        },
        wednesday: { title: 'Conditioning', generic: true },
        sunday: { title: 'Easy Conditioning', generic: true },
      },
    },
    {
      id: 6,
      name: 'Consolidation',
      weekRange: [21, 24],
      goal: 'Maximum sustainable strength + fat loss',
      intro: 'This is your strength + fat-loss phase.',
      days: {
        tuesday: {
          title: 'Tuesday',
          exercises: [
            { name: 'Squat', sets: 4, reps: '5–8' },
            { name: 'Push-up', sets: 4, reps: '5–10' },
            { name: 'Pull-up progression', sets: 4, reps: '5–8' },
            { name: 'Romanian deadlift', sets: 3, reps: '6–8' },
            { name: 'Split squat', sets: 3, reps: '6/leg' },
            { name: 'Core', sets: 3, reps: '3 sets' },
          ],
        },
        saturday: {
          title: 'Saturday',
          exercises: [
            { name: 'Squat variation', sets: 4, reps: '5–8' },
            { name: 'Push-up', sets: 4, reps: '5–10' },
            { name: 'Row', sets: 4, reps: '6–10' },
            { name: 'Hip thrust', sets: 3, reps: '8–10' },
            { name: 'Step-up', sets: 3, reps: '8/leg' },
            { name: 'Carry', sets: 4, reps: '40–60 m' },
          ],
          note: WALKING_PROGRESSION_NOTE,
        },
        wednesday: { title: 'Conditioning', generic: true },
        sunday: { title: 'Easy Conditioning', generic: true },
      },
    },
  ],

  progressionRule: {
    intro: "Don't arbitrarily add exercises every few weeks. Progress the exercises you already have.",
    chains: [
      ['Wall push-up', 'high incline', 'low incline', 'bench', 'floor push-up'],
      ['Chair squat', 'bodyweight squat', 'goblet squat', 'heavier goblet squat', 'harder unilateral squat'],
      ['Band row', 'higher-resistance band', 'inverted row', 'feet further forward', 'harder row'],
    ],
    rule: 'When you can perform the top end of the rep range with excellent technique, increase the difficulty slightly.',
    rir: "Keep roughly 2–3 reps in reserve most of the time — you should finish a set feeling that you could have done a couple more reps. That is much better for your joints and recovery than repeatedly training to failure.",
  },

  walkingGuide: {
    intro: "For your weight-loss goal, don't rely on calisthenics alone. Walking is exceptionally useful because it gives you additional energy expenditure without the impact of running.",
    progression: [
      { day: 'Wednesday', range: '30 → 45 min' },
      { day: 'Sunday', range: '40 → 60 min' },
    ],
    extra: "Then gradually add short walks on Monday/Thursday/Friday as convenient. Eventually, something like 30–45 minutes of walking on most days would be excellent. Adults are advised to reach at least 150 min/week of moderate activity, and additional activity provides further benefit.",
    consistency: 'Don\'t worry about speed initially. Consistency beats intensity.',
  },

  weightLoss: {
    p1: "Exercise will help, but your calorie intake will probably determine the majority of your weight loss. Physical activity and diet work together for weight management.",
    p2: "A reasonable target is roughly 0.5–1 kg per week, rather than trying to lose weight as rapidly as possible. CDC guidance describes gradual loss of about 1–2 lb/week as more sustainable. At 127 kg, even losing 10% of your starting weight would be a very meaningful first milestone.",
  },

  tracking: {
    intro: 'What to Track',
    items: [
      { key: 'bodyWeight', label: 'Body weight', hint: '3–7 mornings/week → use weekly average', unit: 'kg' },
      { key: 'waist', label: 'Waist', hint: 'once/week', unit: 'cm' },
      { key: 'pushup', label: 'Push-ups', hint: 'best clean set', unit: 'reps' },
      { key: 'squat', label: 'Squat', hint: 'variation + reps/load', unit: 'text' },
      { key: 'row', label: 'Row/pull-up', hint: 'variation + reps', unit: 'text' },
      { key: 'walking', label: 'Walking', hint: 'weekly minutes', unit: 'min' },
    ],
    trendNote: 'Your scale will occasionally stall because water weight fluctuates. Look at the 4-week trend, not individual days.',
  },

  equipment: {
    intro: "You don't need a full gym. A very good setup would be:",
    items: [
      'Sturdy exercise bench/box',
      'Resistance bands',
      'Pair of adjustable dumbbells',
      "Doorway/wall pull-up bar rated for your weight",
      'Exercise mat',
    ],
    note: "The dumbbells aren't \"cheating\" on calisthenics — they make progressive overload considerably easier while you're carrying 127 kg.",
  },

  philosophyChange: {
    title: 'One Change to the Classic Calisthenics Philosophy',
    text: "Don't make \"pure bodyweight only\" a hard rule. At your current weight, losing body fat while building strength creates a fantastic combination: your relative strength improves in both directions. A push-up gets easier because you're stronger and because you're moving less body mass. That's the combination to aim for over these six months.",
  },

  closingQuote: "And at 54, better to finish six months with better knees, stronger legs, a stronger back, significantly better cardiovascular fitness, and 10–20+ kg less bodyweight than six months of heroic workouts followed by an injury.",

  references: [
    { text: 'CDC — Steps for Losing Weight, Healthy Weight and Growth.', url: 'https://www.cdc.gov/healthy-weight-growth/losing-weight/' },
    { text: 'CDC — Adding Physical Activity as an Adult, Physical Activity Basics.', url: 'https://www.cdc.gov/physical-activity-basics/adding-adults/' },
    { text: "ACSM — Working with Older Adults? Don't Skimp on Strength Training.", url: 'https://www.acsm.org/older-adults-strength-training' },
    { text: 'CDC — Tips for Maintaining Healthy Weight, Healthy Weight and Growth.', url: 'https://www.cdc.gov/healthy-weight-growth/about/tips-for-balancing-food-activity/' },
  ],
};
