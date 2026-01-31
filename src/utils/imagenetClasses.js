export const IMAGENET_CLASSES = {
    0: 'tench, Tinca tinca',
    1: 'goldfish, Carassius auratus',
    2: 'great white shark, white shark, man-eater, man-eating shark, Carcharodon carcharias',
    // ... (truncating for brevity, users usually fetch this JSON)
    // I will fetch it dynamically in the app or use a simplified list.
    // For the sake of this file, I'll export a fetch function.
};

export const fetchClasses = async () => {
    const response = await fetch('https://storage.googleapis.com/download.tensorflow.org/data/imagenet_class_index.json');
    const json = await response.json();
    // converting object {0: ['n01440764', 'tench'], ...} to flat array or map
    const classes = {};
    Object.keys(json).forEach(key => {
        classes[key] = json[key][1];
    });
    return classes;
}
