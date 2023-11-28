tooltip
  .html(
    `<strong>${d.name}</strong><br/>Antal hajangreb: ${d.value}<br/>Fun Fact: ${d.fact}<br/><br/> <span id="source">Kilde: <a href="${d.kilde}" </a></span>`
  )
  .style("left", "300px")
  .style("top", "2350px")
  .style("pointer-events", "auto");

const top5Countries = [
  {
    name: "USA",
    value: 2171,
    flag: "verdenskort/flag/usaflag.png",
    fact: 'Staterne med flest hajangreb nogensinde registreret er Florida, Hawaii, Californien og Carolina. Florida er kendt som "verdens hajangrebshovedstad" og står for mere end halvdelen af alle hajangreb i USA hvert år.',
    kilde: "https://www.siyachts.com/where-most-shark-attacks-occur",
  },

  {
    name: "Australia",
    value: 1302,
    flag: "verdenskort/flag/australiaflag.png",
    fact: "- I gennemsnit bliver én person dræbt af et hajangreb om året i Australien.\n- 5 personer dør af at falde ud af sengen.\n- 10 personer bliver ramt af lynet.",
    kilde:
      "https://www.oceanlifeeducation.com.au/wp-content/uploads/2020/12/Australian-Sharks-Fact-Sheet_watermark.pdf",
  },

  {
    name: "South Africa",
    value: 571,
    flag: "verdenskort/flag/southafricaflag.png",
    fact: "Sydafrikas kystlinjer er en af de top tre globale hotspots for mangfoldighed af hajer og rokker, hvor der er registreret 204 forskellige arter.",
    kilde:
      "https://oceanographicmagazine.com/features/in-search-of-sharks-in-south-africa/",
  },

  {
    name: "Papua New Guinea",
    value: 160,
    flag: "verdenskort/flag/papuanewguineaflag.png",
    fact: "Papua New Guinea (PNG) huser 132 haj- og rokkearter, herunder nogle af de mest truede arter som hammerhajer, savfisk og næsehornrokker. Ikke desto mindre er de globale bestande af flere af disse storslåede arter faldet med mere end 70%, og hvis der ikke gøres noget, vil de uddø i vores farvande.",
    kilde:
      "https://www.wwfpacific.org/?379175/TOWARDS-SAVING-SHARKS-AND-RAYS-IN-PNG",
  },

  {
    name: "New Zealand",
    value: 126,
    flag: "verdenskort/flag/newzealandflag.png",
    fact: "I januar 2020 opdagede de, at tre dybhavshajarter ud for New Zealand lyser i mørket. Mallefet, en ekspert i bioluminescens fra The Catholic University of Louvain i Belgien, siger, at andre studier antyder, at omkring 10 procent af jordens cirka 540 hajarter kan lyse.",
    kilde:
      "https://www.nzgeo.com/stories/glow-in-the-dark-sharks/\nhttps://www.bbc.com/news/world-asia-56256808",
  },
];
