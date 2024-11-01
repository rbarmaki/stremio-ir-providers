export function getBetweenParentheses(str){
    const regex = /\(([^)]+)\)/;
    const match = str.match(regex);

    return match ? match[1] : null;
}