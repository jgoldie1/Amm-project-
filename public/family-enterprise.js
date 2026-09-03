'use strict';

const family = [
  { name: 'Jacobie Stubbs', group: 'Child', focus: ['Jacobie Vision', 'Real Estate & Home Flipping', 'Career Freedom'], ownership: 'To be documented' },
  { name: 'Isaiah Stubbs', group: 'Child', focus: ['Isaiah AI TV', 'Media & Technology', 'Career Freedom'], ownership: 'To be documented' },
  { name: 'Aniyah', group: 'Child', focus: ['Aniyah 64-Track Studio', 'Aniyah Global Pay', 'OB-GYN Pathway', 'Career Freedom'], ownership: 'To be documented' },
  { name: 'Adrian', group: 'Child', focus: ['Life Navigator', 'Education & Opportunity', 'Career Freedom'], ownership: 'To be documented' },
  { name: 'Faith', group: 'Child', focus: ['Life Navigator', 'Education & Opportunity', 'Career Freedom'], ownership: 'To be documented' },
  { name: 'Alton Stubbs', group: 'Extended family', focus: ['Family Legacy Tree'], ownership: 'Not assigned' },
  { name: 'Kevon Stubbs', group: 'Extended family', focus: ['Family Legacy Tree'], ownership: 'Not assigned' },
  { name: 'Shawndell Shelton', group: 'Extended family', focus: ['Family Legacy Tree'], ownership: 'Not assigned' },
  { name: 'Carrio Stubbs', group: 'Extended family', focus: ['Family Legacy Tree'], ownership: 'Not assigned' },
  { name: 'Kenny P.', group: 'Extended family', focus: ['Family Legacy Tree', 'Surname pending'], ownership: 'Not assigned' },
  { name: 'Raymond Jarreau', group: 'Extended family', focus: ['Family Legacy Tree', 'Uncle'], ownership: 'Not assigned' },
  { name: 'Asjisa Watson', group: 'Extended family', focus: ['Family Legacy Tree'], ownership: 'Not assigned' },
  { name: 'Deon Hamilton', group: 'Extended family', focus: ['Family Legacy Tree'], ownership: 'Not assigned' }
];

const enterprises = [
  { name: 'Jacobie Vision', lane: 'Technology + Property', model: 'Cybersecurity, computer vision, 3D/property media, real-estate analysis and home-flipping operations with licensed professionals where required.' },
  { name: 'Isaiah AI TV', lane: 'Media', model: 'Channels, live programming, sports, creator TV, advertising, subscriptions, production and licensing.' },
  { name: 'Aniyah 64-Track Studio', lane: 'Music', model: 'Recording, production, mixing, mastering, rights metadata, distribution services, video and live-performance production.' },
  { name: 'Aniyah Global Pay', lane: 'Financial technology', model: 'Cross-border payment experience built around compliant, licensed payment partners and separate accounting.' },
  { name: 'Who Wants to Be a Star', lane: 'Entertainment', model: 'Auditions, training, competition, sponsorship, advertising, ticketing and talent development.' },
  { name: 'StarVerse', lane: 'Virtual entertainment', model: 'Persistent artist world for virtual concerts, creator commerce, fan communities, sponsorship and events.' },
  { name: 'All American University', lane: 'Education + Workforce', model: 'Life Navigator, skills labs, real-world projects, apprenticeships and pathways to external accredited/licensed careers.' },
  { name: 'TRYAMM Broadcast & Entertainment', lane: 'Production', model: 'Creator studio, network tools, agency operations, news/weather production, concerts, distribution and commercial broadcast services.' }
];

const succession = [
  { name: 'Family Opportunity Fund', text: 'Education, retraining, certifications, entrepreneurship and approved opportunity support without forcing a fixed career.' },
  { name: 'Family Legacy & IP Vault', text: 'Inventory ownership, creator credits, licenses, royalties, successors and governing documents for valuable IP and assets.' },
  { name: 'Family Enterprise Registry', text: 'Keep family relationship, beneficiary status, economic ownership, voting control and employment authority as separate fields.' },
  { name: 'Family Council', text: 'A governance and learning forum that does not automatically grant bank access, management authority or ownership.' },
  { name: 'Succession Engine', text: 'Track intended actions for death, incapacity, retirement, leadership changes and career changes; legal documents remain controlling.' },
  { name: 'Future Marriage Review', text: 'If the founder later marries, trigger a formal review of estate, beneficiary, ownership and succession documents.' }
];

const pathway = [
  ['Dream', 'Choose or change direction'],
  ['Requirements', 'Map degrees, licenses and skills'],
  ['Education', 'AAU plus external accredited programs'],
  ['Mentors', 'Industry and professional guidance'],
  ['Experience', 'Labs, internships and projects'],
  ['Credential', 'Complete required external licensing'],
  ['Work', 'Job, practice or business'],
  ['Reinvent', 'Fund and support a second path']
];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[c]));
}

function pills(items) {
  return `<div class="pill-row">${items.map(item => `<span class="pill">${escapeHtml(item)}</span>`).join('')}</div>`;
}

document.querySelector('#summary').innerHTML = [
  [family.length, 'family profiles'],
  [enterprises.length, 'enterprise lanes'],
  [5, 'children with career freedom'],
  [succession.length, 'legacy controls']
].map(([value, label]) => `<article class="metric"><strong>${value}</strong><span>${label}</span></article>`).join('');

document.querySelector('#family-grid').innerHTML = family.map(person => `
  <article class="card">
    <p class="eyebrow">${escapeHtml(person.group)}</p>
    <h3>${escapeHtml(person.name)}</h3>
    ${pills(person.focus)}
    <p><strong>Ownership:</strong> ${escapeHtml(person.ownership)}</p>
  </article>`).join('');

document.querySelector('#enterprise-grid').innerHTML = enterprises.map(item => `
  <article class="card">
    <p class="eyebrow">${escapeHtml(item.lane)}</p>
    <h3>${escapeHtml(item.name)}</h3>
    <p>${escapeHtml(item.model)}</p>
  </article>`).join('');

document.querySelector('#pathway-flow').innerHTML = pathway.map(([title, detail], index) => `
  <div class="flow-step">${index + 1}. ${escapeHtml(title)}<small>${escapeHtml(detail)}</small></div>`).join('');

document.querySelector('#succession-grid').innerHTML = succession.map(item => `
  <article class="card"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('');
