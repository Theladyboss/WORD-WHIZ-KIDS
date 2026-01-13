
export const OFFLINE_DATA = {
    digraph: [
        { word: "graph", missing: "ph", context: "I drew a ___ to show my data.", phoneme: "ph", options: ["ph", "th", "sh", "ch"] },
        { word: "teaching", missing: "ch", context: "The teacher is ___ us to read.", phoneme: "ch", options: ["ch", "sh", "th", "wh"] },
        { word: "birthday", missing: "th", context: "Today is my ___.", phoneme: "th", options: ["th", "ch", "ph", "sh"] },
        { word: "whisper", missing: "wh", context: "Please ___ in the library.", phoneme: "wh", options: ["wh", "sh", "th", "ch"] },
        { word: "washing", missing: "sh", context: "I am ___ the dishes.", phoneme: "sh", options: ["sh", "ch", "th", "wh"] },
        { word: "dolphin", missing: "ph", context: "The ___ jumps high.", phoneme: "ph", options: ["ph", "th", "sh", "ch"] },
        { word: "bathtub", missing: "th", context: "I take a bath in the ___.", phoneme: "th", options: ["th", "ph", "ch", "sh"] }
    ],
    spell: [
        { word: "because", context: "I stayed home because it was raining." },
        { word: "beautiful", context: "The sunset is beautiful tonight." },
        { word: "different", context: "We are all different and special." },
        { word: "important", context: "Reading is very important." },
        { word: "together", context: "Let's work together as a team." },
        { word: "another", context: "Can I have another cookie?" },
        { word: "people", context: "Many people came to the party." }
    ],
    syllable: [
        // 1 syllable
        { word: "cat", syllables: ["cat"], count: 1, context: "The cat is fluffy.", type: "CVC" },
        { word: "bike", syllables: ["bike"], count: 1, context: "I ride my bike.", type: "VCE" },
        { word: "jump", syllables: ["jump"], count: 1, context: "Jump high!", type: "Closed" },
        // 2 syllables
        { word: "rabbit", syllables: ["rab", "bit"], count: 2, context: "The rabbit hops fast.", type: "Closed" },
        { word: "tiger", syllables: ["ti", "ger"], count: 2, context: "The tiger has stripes.", type: "Open" },
        { word: "napkin", syllables: ["nap", "kin"], count: 2, context: "Use a napkin.", type: "Closed" },
        // 3 syllables
        { word: "banana", syllables: ["ba", "na", "na"], count: 3, context: "I like bananas.", type: "Open" },
        { word: "hamburger", syllables: ["ham", "bur", "ger"], count: 3, context: "Let's eat a hamburger.", type: "Mixed" },
        { word: "butterfly", syllables: ["but", "ter", "fly"], count: 3, context: "The butterfly is pretty.", type: "Mixed" },
        // 4 syllables
        { word: "helicopter", syllables: ["hel", "i", "cop", "ter"], count: 4, context: "The helicopter is flying.", type: "Mixed" },
        { word: "alligator", syllables: ["al", "li", "ga", "tor"], count: 4, context: "The alligator swims.", type: "Mixed" },
        { word: "watermelon", syllables: ["wa", "ter", "mel", "on"], count: 4, context: "I love watermelon.", type: "Open" }
    ],
    vowelSort: [
        // Short vowels
        { word: "fantastic", category: "short", vowel: "a", context: "That was a fantastic show!" },
        { word: "problem", category: "short", vowel: "o", context: "Let's solve this problem together." },
        { word: "excellent", category: "short", vowel: "e", context: "You did an excellent job!" },
        // Long vowels
        { word: "explain", category: "long", vowel: "a", context: "Can you explain how it works?" },
        { word: "polite", category: "long", vowel: "i", context: "It's polite to say thank you." },
        { word: "hopeful", category: "long", vowel: "o", context: "I am hopeful we will win." },
        // R-Controlled
        { word: "important", category: "r-controlled", vowel: "or", context: "Vegetables are important." },
        { word: "perfectly", category: "r-controlled", vowel: "er", context: "You sang perfectly!" },
        { word: "carnival", category: "r-controlled", vowel: "ar", context: "We went to the carnival." }
    ],
    rControlled: [
        // Has R-Controlled
        { word: "harvest", syllables: ["har", "vest"], hasRControlled: true, rSyllable: "har", context: "Farmers harvest crops." },
        { word: "assortment", syllables: ["as", "sort", "ment"], hasRControlled: true, rSyllable: "sort", context: "An assortment of candy." },
        { word: "departed", syllables: ["de", "part", "ed"], hasRControlled: true, rSyllable: "part", context: "The train departed." },
        // No R-Controlled
        { word: "demonstrate", syllables: ["dem", "on", "strate"], hasRControlled: false, rSyllable: null, context: "I will demonstrate." },
        { word: "comprehend", syllables: ["com", "pre", "hend"], hasRControlled: false, rSyllable: null, context: "I comprehend the lesson." },
        { word: "radical", syllables: ["rad", "i", "cal"], hasRControlled: false, rSyllable: null, context: "That's radical!" }
    ],
    nControlled: [
        // Has N-Controlled
        { word: "broken", syllables: ["bro", "ken"], hasNControlled: true, nSyllable: "en", context: "The toy is broken." },
        { word: "napkin", syllables: ["nap", "kin"], hasNControlled: true, nSyllable: "in", context: "Use a napkin." },
        { word: "human", syllables: ["hu", "man"], hasNControlled: true, nSyllable: "an", context: "I am human." },
        { word: "pumpkin", syllables: ["pump", "kin"], hasNControlled: true, nSyllable: "in", context: "The pumpkin is orange." },
        { word: "open", syllables: ["o", "pen"], hasNControlled: true, nSyllable: "en", context: "Please open the door." },
        // No N-Controlled
        { word: "pizza", syllables: ["piz", "za"], hasNControlled: false, nSyllable: null, context: "I like pizza." },
        { word: "happy", syllables: ["hap", "py"], hasNControlled: false, nSyllable: null, context: "I am happy." },
        { word: "tiger", syllables: ["ti", "ger"], hasNControlled: false, nSyllable: null, context: "The tiger roars." }
    ],
    schwa: [
        { word: "balloon", syllables: ["bal", "loon"], count: 2, context: "The red balloon floated away.", type: "Schwa" },
        { word: "about", syllables: ["a", "bout"], count: 2, context: "Tell me about your day.", type: "Schwa" },
        { word: "panda", syllables: ["pan", "da"], count: 2, context: "The panda eats bamboo.", type: "Schwa" },
        { word: "sofa", syllables: ["so", "fa"], count: 2, context: "Sit on the sofa.", type: "Schwa" },
        { word: "zebra", syllables: ["ze", "bra"], count: 2, context: "The zebra has black and white stripes.", type: "Schwa" }
    ],
    vce: [
        { word: "cake", syllables: ["cake"], count: 1, context: "I like chocolate cake.", type: "VCE" },
        { word: "bike", syllables: ["bike"], count: 1, context: "I ride my bike to school.", type: "VCE" },
        { word: "home", syllables: ["home"], count: 1, context: "Let's go home now.", type: "VCE" },
        { word: "cute", syllables: ["cute"], count: 1, context: "The puppy is very cute.", type: "VCE" },
        { word: "nose", syllables: ["nose"], count: 1, context: "Touch your nose.", type: "VCE" }
    ],
    contractions: [
        { word: "do not", contraction: "don't", context: "Please do not run." },
        { word: "can not", contraction: "can't", context: "I can not fly." },
        { word: "is not", contraction: "isn't", context: "It is not raining." },
        { word: "we are", contraction: "we're", context: "We are going to the park." },
        { word: "he is", contraction: "he's", context: "He is my brother." }
    ],
    dictation: [
        { sentence: "The cat sat on the mat." },
        { sentence: "I like to read books." },
        { sentence: "The sun is hot." },
        { sentence: "My dog can run fast." },
        { sentence: "We play in the sand." }
    ],
    story: [
        { starter: "The mysterious package arrived at midnight. When I opened it, I discovered something incredible inside." },
        { starter: "Deep in the enchanted forest, the ancient tree whispered a secret that would change everything." },
        { starter: "The astronaut floated outside the spaceship and noticed something strange approaching from the stars." },
        { starter: "On the first day of my magical adventure, I found a golden key that unlocked a hidden door." }
    ],
    "teacher-curriculum": [
        { starter: "Phonics: Have students sort words by their vowel sounds (Short A vs Long A).", context: "Phonics / Sorting" },
        { starter: "Reading: Read 'The Cat in the Hat' and discuss the rhyming words.", context: "Reading Comprehension" },
        { starter: "Writing: Write 3 sentences about their favorite animal.", context: "Writing Practice" }
    ],
    "chunk-blend": [
        { word: "bright", onset: "br", rime: "ight", context: "The sun is bright today." },
        { word: "block", onset: "bl", rime: "ock", context: "I play with a block." },
        { word: "stand", onset: "st", rime: "and", context: "Please stand up." },
        { word: "truck", onset: "tr", rime: "uck", context: "The truck is big." },
        { word: "ship", onset: "sh", rime: "ip", context: "The ship sails on the sea." }
    ]
};
