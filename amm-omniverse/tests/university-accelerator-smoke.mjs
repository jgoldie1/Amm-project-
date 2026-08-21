import fs from 'node:fs'
const read=p=>fs.readFileSync(p,'utf8');const must=(c,m)=>{if(!c)throw new Error(`UNIVERSITY ACCELERATOR SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),hub=read('src/components/AllAmericanUniversityLauncher.tsx'),migration=read('supabase/migrations/202608120008_all_american_university.sql'),passport=read('src/education/learningPassport.ts'),jarvis=read('src/education/studentJarvis.ts'),opps=read('src/education/studentOpportunity.ts'),env=read('.env.example')
must(main.includes('<AllAmericanUniversityLauncher />'),'university launcher must be mounted')
for(const token of ['university_programs','university_courses','university_opportunities','university_students','Learning Passport + Student Jarvis','SEND TO IMMERSIVE / GAME MISSION','Accreditation truth'])must(hub.includes(token),token)
for(const table of ['university_students','university_faculty','university_programs','university_courses','university_sections','university_enrollments','university_assignments','university_exams','university_credentials','university_library_items','university_labs','university_opportunities','university_hbcu_partners','university_black_excellence_programs'])must(migration.includes(table),`schema ${table}`)
must(migration.includes('enable row level security'),'university RLS')
for(const token of ['createLearningPassport','coreLearningCredentials','learningPassportSummary'])must(passport.includes(token),`Learning Passport ${token}`)
for(const token of ['buildStudyPlan','schoolSafetyBoundary','nextSchoolActions'])must(jarvis.includes(token),`Student Jarvis ${token}`)
must(opps.includes('matchStudentOpportunity')&&opps.includes('rankStudentOpportunities'),'student opportunity matcher')
must(env.includes('VITE_ALL_AMERICAN_UNIVERSITY_ENABLED=false'),'university production feature flag')
console.log('✅ All American University accelerator contract passed')
