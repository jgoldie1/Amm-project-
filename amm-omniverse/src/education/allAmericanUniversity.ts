export type EducationDivision = 'prek'|'k12'|'ged-adult'|'trade-school'|'career-academy'|'undergraduate'|'graduate'|'doctoral'|'continuing-education';
export type DeliveryMode = 'ai-guided'|'human-led'|'hybrid'|'lab'|'apprenticeship';
export type InstructorStatus = 'applicant'|'verified'|'active'|'suspended';

export type InstructorProfile = {
  id:string; displayName:string; specialties:string[]; status:InstructorStatus; credentialsVerified:boolean;
  backgroundCheckRequired:boolean; backgroundCheckVerified:boolean; canSuperviseHandsOn:boolean; canGrade:boolean;
};

export type Course = {
  id:string; title:string; division:EducationDivision; category:string; delivery:DeliveryMode[];
  requiresHumanInstructor:boolean; requiresHandsOnSupervision:boolean; regulatedField:boolean;
  credentialClaim:'learning-record'|'completion-certificate'|'industry-cert-prep'|'degree-pathway'|'ged-prep'|'school-support';
  modules:string[]; outcomes:string[];
};

export const ALL_AMERICAN_UNIVERSITY_COURSES:Course[] = [
  {id:'prek-foundations',title:'Pre-K Learning Foundations',division:'prek',category:'Early Learning',delivery:['ai-guided','human-led','hybrid'],requiresHumanInstructor:true,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'school-support',modules:['letters + sounds','numbers','stories','art + music','motor activities','social-emotional learning','family activities'],outcomes:['Build school-readiness skills','Create a family learning record']},
  {id:'k12-core',title:'K–12 Core Learning Support',division:'k12',category:'School Support',delivery:['ai-guided','human-led','hybrid'],requiresHumanInstructor:true,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'school-support',modules:['English language arts','mathematics','science','social studies','digital literacy','study skills','portfolio evidence'],outcomes:['Strengthen grade-level skills','Maintain a learning portfolio']},
  {id:'ged-prep',title:'GED / High-School Equivalency Preparation',division:'ged-adult',category:'Adult Education',delivery:['ai-guided','human-led','hybrid'],requiresHumanInstructor:false,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'ged-prep',modules:['reasoning through language arts','mathematical reasoning','science','social studies','test strategy','practice exams'],outcomes:['Prepare for an external authorized equivalency exam','Build a transition plan for college, trade or work']},
  {id:'ai-foundations',title:'AI Foundations + Responsible AI',division:'undergraduate',category:'Artificial Intelligence',delivery:['ai-guided','human-led','hybrid'],requiresHumanInstructor:false,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'completion-certificate',modules:['AI concepts','prompting','data literacy','model limits','privacy','responsible use','AI project lab'],outcomes:['Use AI productively','Evaluate AI output','Build a supervised AI project']},
  {id:'ai-builder',title:'Applied AI Builder',division:'career-academy',category:'Artificial Intelligence',delivery:['hybrid','lab'],requiresHumanInstructor:true,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'completion-certificate',modules:['APIs','agents','automation','evaluation','security','deployment','portfolio project'],outcomes:['Build a small AI workflow','Test and document an AI system']},
  {id:'cyber-defense',title:'Cybersecurity + Defensive Operations',division:'undergraduate',category:'Cybersecurity',delivery:['hybrid','lab'],requiresHumanInstructor:true,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'industry-cert-prep',modules:['networking','identity','endpoint security','phishing','logging','incident response','authorized security lab'],outcomes:['Perform defensive QA','Document findings','Prepare for entry-level certification pathways']},
  {id:'realestate-ops',title:'Real Estate Analysis + Flip Operations',division:'career-academy',category:'Real Estate',delivery:['hybrid','lab'],requiresHumanInstructor:true,requiresHandsOnSupervision:false,regulatedField:true,credentialClaim:'completion-certificate',modules:['comps','ARV','rehab budgets','carry costs','project documentation','property media','3D scans','Holo listings','marketing','record security'],outcomes:['Analyze a simulated deal','Build a project packet','Know when a licensed professional is required']},
  {id:'electrical',title:'Electrical Trades Foundations',division:'trade-school',category:'Electrical',delivery:['human-led','lab','apprenticeship'],requiresHumanInstructor:true,requiresHandsOnSupervision:true,regulatedField:true,credentialClaim:'industry-cert-prep',modules:['safety','tools','circuits','code literacy','diagnostics','hands-on lab','apprenticeship readiness'],outcomes:['Demonstrate supervised fundamentals','Prepare for apprenticeship/licensing pathway']},
  {id:'hvac',title:'HVAC/R Foundations',division:'trade-school',category:'HVAC',delivery:['human-led','lab','apprenticeship'],requiresHumanInstructor:true,requiresHandsOnSupervision:true,regulatedField:true,credentialClaim:'industry-cert-prep',modules:['safety','refrigeration concepts','electrical basics','airflow','diagnostics','EPA 608 prep','hands-on lab'],outcomes:['Demonstrate supervised HVAC fundamentals','Prepare for certification/apprenticeship pathway']},
  {id:'plumbing',title:'Plumbing Foundations',division:'trade-school',category:'Plumbing',delivery:['human-led','lab','apprenticeship'],requiresHumanInstructor:true,requiresHandsOnSupervision:true,regulatedField:true,credentialClaim:'industry-cert-prep',modules:['safety','tools','water systems','drainage','fixtures','code literacy','hands-on lab'],outcomes:['Demonstrate supervised plumbing fundamentals','Prepare for apprenticeship/licensing pathway']},
  {id:'carpentry',title:'Carpentry + Construction',division:'trade-school',category:'Construction',delivery:['human-led','lab','apprenticeship'],requiresHumanInstructor:true,requiresHandsOnSupervision:true,regulatedField:false,credentialClaim:'completion-certificate',modules:['site safety','measurement','framing','finish carpentry','estimating','plans','build lab'],outcomes:['Complete supervised build tasks','Produce a construction portfolio']},
  {id:'welding',title:'Welding Foundations',division:'trade-school',category:'Welding',delivery:['human-led','lab','apprenticeship'],requiresHumanInstructor:true,requiresHandsOnSupervision:true,regulatedField:true,credentialClaim:'industry-cert-prep',modules:['PPE','shop safety','processes','materials','joints','inspection basics','supervised weld lab'],outcomes:['Demonstrate supervised welding fundamentals','Prepare for external certification pathway']},
  {id:'automotive',title:'Automotive Service Foundations',division:'trade-school',category:'Automotive',delivery:['human-led','lab','apprenticeship'],requiresHumanInstructor:true,requiresHandsOnSupervision:true,regulatedField:false,credentialClaim:'industry-cert-prep',modules:['shop safety','inspection','brakes','electrical','diagnostics','maintenance','service lab'],outcomes:['Perform supervised service tasks','Prepare for certification/employment pathway']},
  {id:'media-creator',title:'Media Production + Creator Business',division:'career-academy',category:'Media',delivery:['hybrid','lab'],requiresHumanInstructor:true,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'completion-certificate',modules:['camera','audio','editing','reels','LIVE','Holo ads','product placement','rights','portfolio'],outcomes:['Produce portfolio media','Support creator and advertising operations']},
  {id:'entrepreneurship',title:'Entrepreneurship + Small Business Operations',division:'undergraduate',category:'Business',delivery:['ai-guided','human-led','hybrid'],requiresHumanInstructor:false,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'completion-certificate',modules:['business model','pricing','sales','operations','bookkeeping literacy','marketing','risk','pitch'],outcomes:['Build an operating plan','Understand revenue, cost and compliance basics']},
  {id:'bachelors-pathway',title:'Bachelor-Level Pathway Planning',division:'undergraduate',category:'Degree Pathways',delivery:['human-led','hybrid'],requiresHumanInstructor:true,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'degree-pathway',modules:['general education map','major map','portfolio','transfer planning','partner-institution review'],outcomes:['Build a degree-completion map','Identify authorized degree-granting partners']},
  {id:'masters-pathway',title:'Master-Level Pathway Planning',division:'graduate',category:'Graduate Study',delivery:['human-led','hybrid'],requiresHumanInstructor:true,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'degree-pathway',modules:['graduate research literacy','specialization planning','capstone/thesis options','partner-institution review'],outcomes:['Build a graduate-study plan','Identify authorized graduate programs']},
  {id:'doctoral-pathway',title:'Doctoral / PhD Pathway Planning',division:'doctoral',category:'Doctoral Study',delivery:['human-led','hybrid'],requiresHumanInstructor:true,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'degree-pathway',modules:['research methods','literature review','proposal development','ethics','dissertation planning','partner-institution review'],outcomes:['Build a doctoral preparation plan','Identify authorized degree-granting institutions']},
  {id:'continuing-ed',title:'Continuing Education + Professional Upskilling',division:'continuing-education',category:'Professional Learning',delivery:['ai-guided','human-led','hybrid'],requiresHumanInstructor:false,requiresHandsOnSupervision:false,regulatedField:false,credentialClaim:'completion-certificate',modules:['skills assessment','microlearning','portfolio update','career mapping'],outcomes:['Document updated skills','Create a next-step career plan']},
];

export const AAU_RULES = {
  aiIsTutorNotSoleAuthority:true,
  humanInstructorRequiredForHandsOnSafety:true,
  regulatedWorkRequiresQualifiedProfessional:true,
  noUnverifiedDegreeOrAccreditationClaims:true,
  noGuaranteedJobsAdmissionsLicensesOrFunding:true,
  academicIntegrityRequired:true,
  accessibilityPassportSupported:true,
  portfolioEvidenceRequiredForWorkforceProgression:true,
  minorsRequireAgeAppropriateGuardianAndSafetyControls:true,
  degreeGrantingRequiresAuthorizedInstitutionOrPartner:true,
} as const;

export function instructorCanTeach(course:Course,instructor:InstructorProfile){
  if(instructor.status!=='active' || !instructor.credentialsVerified) return false;
  if(course.requiresHandsOnSupervision && !instructor.canSuperviseHandsOn) return false;
  if(instructor.backgroundCheckRequired && !instructor.backgroundCheckVerified) return false;
  return true;
}
