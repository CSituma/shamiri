import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function buildTranscript(options: { includeRisk?: boolean; strength?: 'strong' | 'partial' | 'missed' } = {}) {
  const { includeRisk = false, strength = 'strong' } = options;

  const intro = `
Fellow: Welcome everyone to today's Shamiri group session. My name is Amina, and I am your Shamiri Fellow.
Fellow: Today we are talking about Growth Mindset, the idea that our abilities can grow when we practice and put in effort.
Fellow: I want this to be a safe, respectful space. Feel free to share only what you are comfortable sharing.
`;

  const growthMindsetStrong = `
Fellow: A growth mindset means believing that your brain is like a muscle. The more you use it, the stronger it becomes.
Fellow: When we make mistakes, it doesn't mean we are failures. It just means we are still learning and we can grow from that failure.
Fellow: Effort matters more than so‑called "natural talent". What matters is that you keep trying, keep practicing and keep learning.
Fellow: What do you think about this idea? Has there been a time when practice helped you get better at something?
Student: I used to fail mathematics, but when I started practicing every day, it became easier.
Fellow: Thank you for sharing that. It sounds like it was really hard at first, but you kept going.
`;

  const growthMindsetPartial = `
Fellow: Growth mindset is kind of about trying your best.
Fellow: If you work hard you can improve. Anyway, let's move on.
Student: I am not sure I understood.
Fellow: We will talk more next time.
`;

  const growthMindsetMissed = `
Fellow: Today we will just chat about life and whatever comes to mind.
Fellow: Sometimes people are just born smart or not, that is how it is.
`;

  const facilitationStrong = `
Fellow: I would like to hear from someone who has not spoken yet. What do you think about learning from failure?
Student: I felt ashamed when I failed an exam.
Fellow: It sounds like that was really hard for you. Thank you for trusting us with that.
Fellow: What helped you keep going after that experience?
Student: My friend encouraged me to try again.
Fellow: That is a powerful example of growth. Does anyone else relate to this story?
`;


  const protocolSafe = `
Student: Sometimes I feel very stressed.
Fellow: Thank you for sharing. In this group we focus on Growth Mindset, like how we learn from challenges.
Fellow: If you ever feel you need medical or professional help, it is important to talk to a parent, guardian, teacher, or health professional.
`;

  const riskFragment = includeRisk
    ? `
Student: Sometimes I think about ending my life and I feel like there is no point in going on.
Fellow: Thank you for sharing. That sounds very serious.
`
    : '';

  let growthBlock = growthMindsetStrong;
  if (strength === 'partial') growthBlock = growthMindsetPartial;
  if (strength === 'missed') growthBlock = growthMindsetMissed;

  const middle = `
${growthBlock}
${facilitationStrong}
${protocolSafe}
${riskFragment}
`;

  const outro = `
Fellow: As we close, remember that your brain is like a muscle. Every time you practice, you are helping it grow.
Fellow: Thank you all for participating and supporting each other today.
`;

  return (intro + middle + middle + outro).trim();
}

async function main() {
  await prisma.aIAnalysis.deleteMany();
  await prisma.supervisorReview.deleteMany();
  await prisma.session.deleteMany();
  await prisma.group.deleteMany();
  await prisma.fellow.deleteMany();
  await prisma.supervisor.deleteMany();

  const supervisor = await prisma.supervisor.create({
    data: {
      name: 'Dr. Njeri',
      email: 'njeri.supervisor@example.com',
      tier: 'Tier 2',
    },
  });

  const fellows = await prisma.fellow.createManyAndReturn({
    data: [
      { name: 'Amina' },
      { name: 'Brian' },
      { name: 'Chipo' },
      { name: 'David' },
    ],
  });

  const groups = await prisma.group.createManyAndReturn({
    data: fellows.map((fellow: { id: string }, index: number) => ({
      code: `GM-${100 + index}`,
      fellowId: fellow.id,
      supervisorId: supervisor.id,
    })),
  });

  const now = new Date();
  const sessionsData = [];

  for (let i = 0; i < 10; i++) {
    const fellow = fellows[i % fellows.length];
    const group = groups[i % groups.length];

    const includeRisk = i === 2 || i === 7;
    const strength: 'strong' | 'partial' | 'missed' =
      i % 3 === 0 ? 'strong' : i % 3 === 1 ? 'partial' : 'missed';

    sessionsData.push({
      groupId: group.id,
      fellowId: fellow.id,
      supervisorId: supervisor.id,
      scheduledAt: new Date(now.getTime() - (i + 1) * 2 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - (i + 1) * 60 * 60 * 1000),
      status: 'PENDING_ANALYSIS' as const,
      transcript: buildTranscript({ includeRisk, strength }),
    });
  }

  await prisma.session.createMany({ data: sessionsData });

  console.log('Database seeded with supervisors, fellows, groups, and sessions.');
}

export const seedPromise = main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

