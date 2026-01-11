
export const OFFLINE_DATA = {
    digraph: [
        { word: "ship", missing: "sh", context: "The big ___ sails on the sea.", phoneme: "sh" },
        { word: "chop", missing: "ch", context: "Please ___ the vegetables.", phoneme: "ch" },
        { word: "that", missing: "th", context: "___ is my favorite toy.", phoneme: "th" },
        { word: "whale", missing: "wh", context: "The blue ___ is huge.", phoneme: "wh" },
        { word: "fish", missing: "sh", context: "The ___ swims in the water.", phoneme: "sh" }
    ],
    spell: [
        { word: "happy", context: "I am very happy today." },
        { word: "little", context: "The little dog barked." },
        { word: "play", context: "We like to play outside." },
        { word: "school", context: "We learn at school." },
        { word: "friend", context: "You are my best friend." }
    ],
    syllable: [
        { word: "rabbit", syllables: ["rab", "bit"], count: 2, context: "The rabbit hops fast.", type: "Closed" },
        { word: "tiger", syllables: ["ti", "ger"], count: 2, context: "The tiger has stripes.", type: "Open" },
        { word: "napkin", syllables: ["nap", "kin"], count: 2, context: "Use a napkin to wipe your face.", type: "Closed" },
        { word: "robot", syllables: ["ro", "bot"], count: 2, context: "The robot can dance.", type: "Open" },
        { word: "picnic", syllables: ["pic", "nic"], count: 2, context: "We had a picnic in the park.", type: "Closed" }
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
        { starter: "One day, a magic frog jumped out of the pond. He was wearing a tiny hat." },
        { starter: "Deep in the forest, there was a glowing tree. It whispered secrets to the wind." },
        { starter: "A spaceship landed in my backyard. A green alien walked out." }
    ],
    "teacher-curriculum": [
        { starter: "Phonics: Have students sort words by their vowel sounds (Short A vs Long A).", context: "Phonics / Sorting" },
        { starter: "Reading: Read 'The Cat in the Hat' and discuss the rhyming words.", context: "Reading Comprehension" },
        { starter: "Writing: Write 3 sentences about their favorite animal.", context: "Writing Practice" }
    ]
};
