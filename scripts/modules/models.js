// Face-api.js models management
export class ModelsManager {
    constructor() {
        this.modelsLoaded = false;
        this.labeledFaceDescriptors = [];
    }

    async loadModels() {
        try {
            console.log('Loading face-api.js models...');
            await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('./models');
            await faceapi.nets.faceExpressionNet.loadFromUri('./models');
            this.modelsLoaded = true;
            console.log('✅ All models loaded successfully');
        } catch (error) {
            console.error('❌ Error loading models:', error);
        }
    }

    async loadFaceDescriptors() {
        try {
            const faces = await window.dbManager.getFaceDescriptors();
            this.labeledFaceDescriptors = faces.map(face => 
                new faceapi.LabeledFaceDescriptors(
                    face.name,
                    [new Float32Array(face.descriptor)]
                )
            );
            console.log(`Loaded ${this.labeledFaceDescriptors.length} face descriptors from database`);
        } catch (error) {
            console.error('Error loading face descriptors:', error);
            this.labeledFaceDescriptors = [];
        }
    }

    isReady() {
        return this.modelsLoaded && this.labeledFaceDescriptors.length > 0;
    }

    getFaceMatcher() {
        return new faceapi.FaceMatcher(this.labeledFaceDescriptors, 0.6);
    }
}