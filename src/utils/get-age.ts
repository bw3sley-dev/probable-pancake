import dayjs from "dayjs";

export function getAge(date: string): number {
    const birthDay = dayjs(date);
    
    const age = dayjs().diff(birthDay, 'year');
    
    return age;
}