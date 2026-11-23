/* ============================================================================
   BERIPIKADONG DATABASE NG MGA LOKASYON SA LUCENA CITY
   (Walang dobleng entry at walang inimbentong coordinates)
   ============================================================================ */

const VERIFIED_LOCATIONS = [
  // Mga Paaralan at Institusyong Pang-edukasyon
  { id: "qnhs", name: "Quezon National High School", category: "Mga Paaralan at Institusyong Pang-edukasyon", address: "M.L. Tagarao St., Brgy. Ibabang Iyam, Lucena City", lat: 13.93289, lng: 121.60555 },
  { id: "mseuf", name: "Manuel S. Enverga University Foundation", category: "Mga Paaralan at Institusyong Pang-edukasyon", address: "Enverga Blvd., Brgy. Ibabang Dupay, Lucena City", lat: 13.94946, lng: 121.62040 },
  { id: "shc", name: "Sacred Heart College", category: "Mga Paaralan at Institusyong Pang-edukasyon", address: "1 Merchan St., Lucena City", lat: 13.94073, lng: 121.61634 },
  { id: "maryhill", name: "Maryhill College", category: "Mga Paaralan at Institusyong Pang-edukasyon", address: "M.L. Tagarao St., Lucena City", lat: 13.93602, lng: 121.61246 },
  { id: "dll", name: "Dalubhasaan ng Lungsod ng Lucena", category: "Mga Paaralan at Institusyong Pang-edukasyon", address: "Brgy. Isabang, Lucena City", lat: 13.94655, lng: 121.58976 },
  { id: "slsu-lucena", name: "Southern Luzon State University – Lucena Campus", category: "Mga Paaralan at Institusyong Pang-edukasyon", address: "Brgy. Ibabang Dupay, Lucena City", lat: 13.94875, lng: 121.62854 },
  { id: "hrcs", name: "Holy Rosary Catholic School", category: "Mga Paaralan at Institusyong Pang-edukasyon", address: "Brgy. Cotta, Lucena City", lat: 13.92111, lng: 121.61043 },
  { id: "gnhs", name: "Gulang-Gulang National High School", category: "Mga Paaralan at Institusyong Pang-edukasyon", address: "Lucena City", lat: 13.90983, lng: 121.58097 },
  { id: "sars", name: "St. Alphonsus Regional Seminary", category: "Mga Paaralan at Institusyong Pang-edukasyon", address: "Old Manila South Rd., Lucena City", lat: 13.94496, lng: 121.58930 },

  // Mga Shopping Center at Komersiyal na Lugar
  { id: "sm-lucena", name: "SM City Lucena", category: "Mga Shopping Center at Komersiyal na Lugar", address: "Maharlika Highway cor. Dalahican Rd., Brgy. Ibabang Dupay", lat: 13.94068, lng: 121.62386 },
  { id: "pacific-mall", name: "Pacific Mall Lucena", category: "Mga Shopping Center at Komersiyal na Lugar", address: "M.L. Tagarao St., Lucena City", lat: 13.93687, lng: 121.60904 },
  { id: "public-market", name: "Lucena Public Market", category: "Mga Shopping Center at Komersiyal na Lugar", address: "C.M. Recto St., Lucena City", lat: 13.93386, lng: 121.61461 },
  { id: "savemore-agora", name: "SM Savemore Market (Agora)", category: "Mga Shopping Center at Komersiyal na Lugar", address: "Agora / Brgy. Market View, Lucena City", lat: 13.93437, lng: 121.61501 },
  { id: "market-view", name: "Market View", category: "Mga Shopping Center at Komersiyal na Lugar", address: "Brgy. Market View, Lucena City", lat: 13.93407, lng: 121.61905 },

  // Mga Pampublikong Lugar at Gusali ng Pamahalaan
  { id: "city-hall", name: "Lucena City Hall (New City Government Complex)", category: "Mga Pampublikong Lugar at Gusali ng Pamahalaan", address: "Lucena Diversion Rd., Brgy. Silangang Mayao", lat: 13.96306, lng: 121.63426 },
  { id: "public-library", name: "Lucena City Public Library (Old City Hall)", category: "Mga Pampublikong Lugar at Gusali ng Pamahalaan", address: "M.L. Tagarao St., Poblacion, Lucena City", lat: 13.93652, lng: 121.61152 },
  { id: "perez-park", name: "Perez Park", category: "Mga Pampublikong Lugar at Gusali ng Pamahalaan", address: "Quezon Ave., Brgy. 10, Lucena City", lat: 13.92886, lng: 121.61283 },
  { id: "capitol", name: "Quezon Provincial Capitol", category: "Mga Pampublikong Lugar at Gusali ng Pamahalaan", address: "Quezon Ave., Lucena City", lat: 13.92847, lng: 121.61330 },
  { id: "convention-center", name: "Quezon Convention Center", category: "Mga Pampublikong Lugar at Gusali ng Pamahalaan", address: "Belen Drive, Lucena City", lat: 13.92841, lng: 121.61380 },
  { id: "cathedral", name: "St. Ferdinand Cathedral", category: "Mga Pampublikong Lugar at Gusali ng Pamahalaan", address: "Quezon Ave., Poblacion, Lucena City", lat: 13.93595, lng: 121.61235 },

  // Mga Ospital at Pasilidad Medikal
  { id: "qmc", name: "Quezon Medical Center", category: "Mga Ospital at Pasilidad Medikal", address: "Quezon Ave., Brgy. 11, Lucena City", lat: 13.94222, lng: 121.61255 },
  { id: "ludhmc", name: "Lucena United Doctors Hospital and Medical Center", category: "Mga Ospital at Pasilidad Medikal", address: "Old Manila South Rd., Brgy. Isabang, Lucena City", lat: 13.94702, lng: 121.58509 },
  { id: "mount-carmel", name: "Mount Carmel Diocesan General Hospital", category: "Mga Ospital at Pasilidad Medikal", address: "Allarey Ext., Brgy. 1, Lucena City", lat: 13.94070, lng: 121.61111 },
  { id: "st-anne-hosp", name: "St. Anne General Hospital", category: "Mga Ospital at Pasilidad Medikal", address: "P. Gomez Ext., Red-V, Brgy. Ibabang Dupay", lat: 13.93789, lng: 121.61888 },

  // Mga Pantalan at Lugar ng Transportasyon
  { id: "grand-terminal", name: "Lucena Grand Central Terminal", category: "Mga Pantalan at Lugar ng Transportasyon", address: "Lucena Grand Central Rd., Brgy. Ilayang Dupay", lat: 13.95855, lng: 121.61798 },
  { id: "dalahican-port", name: "Dalahican Port", category: "Mga Pantalan at Lugar ng Transportasyon", address: "Brgy. Dalahican, Lucena City", lat: 13.90683, lng: 121.62608 },
  { id: "fish-port", name: "Lucena Fish Port Complex", category: "Mga Pantalan at Lugar ng Transportasyon", address: "Dalahican Rd., Brgy. Dalahican, Lucena City", lat: 13.90374, lng: 121.62291 },
  { id: "supreme-terminal", name: "Supreme Lucena City Terminal", category: "Mga Pantalan at Lugar ng Transportasyon", address: "Old Manila South Rd., Brgy. Isabang, Lucena City", lat: 13.94557, lng: 121.59137 },
  { id: "pnr-lucena", name: "PNR Lucena Station", category: "Mga Pantalan at Lugar ng Transportasyon", address: "Gov. Constantino St., Brgy. 10, Lucena City", lat: 13.92696, lng: 121.61307 },

  // Mga Barangay at Iba Pang Lugar
  { id: "brgy-iyam", name: "Iyam (Centro)", category: "Mga Barangay at Iba Pang Lugar", address: "Brgy. Iyam / Poblacion IX–X Area, Lucena City", lat: 13.93333, lng: 121.61667 },
  { id: "brgy-ibabang-iyam", name: "Ibabang Iyam", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Ibabang Iyam, Lucena City", lat: 13.92630, lng: 121.60129 },
  { id: "brgy-ilayang-iyam", name: "Ilayang Iyam", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Ilayang Iyam, Lucena City", lat: 13.94113, lng: 121.60264 },
  { id: "brgy-gulang-gulang", name: "Gulang-Gulang", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Gulang-Gulang, Lucena City", lat: 13.96528, lng: 121.60917 },
  { id: "brgy-ilayang-dupay", name: "Ilayang Dupay", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Ilayang Dupay, Lucena City", lat: 13.97591, lng: 121.62316 },
  { id: "brgy-ibabang-dupay", name: "Ibabang Dupay", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Ibabang Dupay, Lucena City", lat: 13.94140, lng: 121.62358 },
  { id: "brgy-isabang", name: "Isabang", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Isabang, Lucena City", lat: 13.94857, lng: 121.58388 },
  { id: "brgy-mayao-crossing", name: "Mayao Crossing", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Mayao Crossing, Lucena City", lat: 13.92576, lng: 121.62178 },
  { id: "brgy-mayao-kanluran", name: "Mayao Kanluran", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Mayao Kanluran, Lucena City", lat: 13.94940, lng: 121.63485 },
  { id: "brgy-mayao-silangan", name: "Mayao Silangan", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Mayao Silangan, Lucena City", lat: 13.95444, lng: 121.64681 },
  { id: "brgy-mayao-parada", name: "Mayao Parada", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Mayao Parada, Lucena City", lat: 13.92714, lng: 121.64358 },
  { id: "brgy-mayao-castillo", name: "Mayao Castillo", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Mayao Castillo, Lucena City", lat: 13.92929, lng: 121.66577 },
  { id: "brgy-cotta", name: "Cotta", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Cotta, Lucena City", lat: 13.91677, lng: 121.60644 },
  { id: "brgy-dalahican", name: "Dalahican", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Dalahican, Lucena City", lat: 13.91110, lng: 121.61710 },
  { id: "brgy-barra", name: "Barra", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Barra, Lucena City", lat: 13.89968, lng: 121.60576 },
  { id: "brgy-domoit", name: "Domoit", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Domoit, Lucena City", lat: 13.96567, lng: 121.59545 },
  { id: "brgy-bocohan", name: "Bocohan", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Bocohan, Lucena City", lat: 13.96126, lng: 121.58583 },
  { id: "brgy-talao-talao", name: "Talao-Talao", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Talao-Talao, Lucena City", lat: 13.91010, lng: 121.64519 },
  { id: "brgy-ransohan", name: "Ransohan (Ransohan Area)", category: "Mga Barangay at Iba Pang Lugar", address: "Ransohan Elementary School Landmark, Brgy. Ransohan, Lucena City", lat: 13.89349, lng: 121.59240 },
  { id: "brgy-salinas", name: "Salinas", category: "Mga Barangay at Iba Pang Lugar", address: "Barangay Salinas, Lucena City", lat: 13.90205, lng: 121.57853 },
  { id: "university-site", name: "University Site", category: "Mga Barangay at Iba Pang Lugar", address: "Brgy. Ibabang Dupay, Lucena City", lat: 13.95631, lng: 121.62121 },
  { id: "bignay-uno", name: "Bignay Uno (Kalapit na Sariaya)", category: "Mga Barangay at Iba Pang Lugar", address: "Bignay 1, Sariaya, Quezon (kalapit ng hangganan ng Lucena)", lat: 13.86444, lng: 121.48806 }
];