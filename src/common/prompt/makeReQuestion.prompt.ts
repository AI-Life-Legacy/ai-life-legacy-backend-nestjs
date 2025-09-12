export function createReQuestionPrompt(question:string,data:string){
    return `
    나는 자서전을 쓰고 있어. ${question} 질문에 대해 ${data}라고 대답했어.
    이 대답을 바탕으로 더 깊이 있는 이야기를 끌어낼 수 있는 구체적이고 흥미로운 2차 질문을 하나 만들어줘.
    질문은 개인적인 경험을 더 상세하게 묻거나, 특정한 감정이나 기억을 이끌어낼 수 있는 것이어야 해. 상황에 맞게 너가 구체적이고 흥미로운 2차 질문을 하나 만들어줘.
    결과물에는 따옴표나 추가 설명 없이 오직 질문만 작성해줘.
    `
}