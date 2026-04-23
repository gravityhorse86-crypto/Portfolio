export default interface Sentence {
    id: number;
    content: string;
    translation: string;
    createdAt: number;
    updatedAt: number;
    statusId: number;
    isTranslated: boolean;
}
