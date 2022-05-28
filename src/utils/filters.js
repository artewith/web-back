const constants = {
  LESSON_ID: 1,
  TUTOR_ID: 2,
  ACCOMPANIST_RECRUIT_ID: 3,
  ACCOMPANIST_RESUME_ID: 4,
};

const boxes = {
  career: [
    { key: 1, name: "2년 미만" },
    { key: 2, name: "2년" },
    { key: 3, name: "3년" },
    { key: 4, name: "4년" },
    { key: 5, name: "5년" },
    { key: 6, name: "6년" },
    { key: 7, name: "7년" },
    { key: 8, name: "8년" },
    { key: 9, name: "9년" },
    { key: 10, name: "10년 이상" },
  ],
  education: [
    { key: "학사", name: "학사" },
    { key: "석사", name: "석사" },
    { key: "박사", name: "박사" },
    { key: "전문연주자과정", name: "전문연주자과정" },
    { key: "최고연주자과정", name: "최고연주자과정" },
    { key: null, name: "미선택" },
  ],
  gender: [
    { key: 1, name: "남성" },
    { key: 2, name: "여성" },
    { key: null, name: "제공안함" },
  ],
  academyWage: [
    { key: 11000, name: "11,000이상" },
    { key: 12000, name: "12,000이상" },
    { key: 13000, name: "13,000이상" },
    { key: 14000, name: "14,000이상" },
    { key: 15000, name: "15,000이상" },
    { key: 16000, name: "16,000이상" },
    { key: 17000, name: "17,000이상" },
    { key: 18000, name: "18,000이상" },
    { key: 19000, name: "19,000이상" },
  ],
  accompanyWage: [
    { key: 20000, name: "2.0이상" },
    { key: 25000, name: "2.5이상" },
    { key: 30000, name: "3.0이상" },
    { key: 35000, name: "3.5이상" },
    { key: 40000, name: "4.0이상" },
    { key: 45000, name: "4.5이상" },
    { key: 50000, name: "5.0이상" },
    { key: 55000, name: "5.5이상" },
    { key: 60000, name: "6.0이상" },
    { key: 65000, name: "6.5이상" },
  ],
  workForm: [
    { key: "파트", name: "파트" },
    { key: "전임", name: "전임" },
    { key: "전임 & 파트", name: "전임 & 파트" },
  ],
  hasLectured: [
    { key: true, name: "유" },
    { key: false, name: "무" },
  ],
  performerField: [
    { key: "피아노", name: "피아노" },
    { key: "성악", name: "성악" },
    { key: "작곡", name: "작곡" },
    { key: "바이올린", name: "바이올린" },
    { key: "비올라", name: "비올라" },
    { key: "첼로", name: "첼로" },
    { key: "콘트라베이스", name: "콘트라베이스" },
    { key: "하프", name: "하프" },
    { key: "플루트", name: "플루트" },
    { key: "오보에", name: "오보에" },
    { key: "클라리넷", name: "클라리넷" },
    { key: "바순", name: "바순" },
    { key: "섹소폰", name: "섹소폰" },
    { key: "호른", name: "호른" },
    { key: "트럼펫", name: "트럼펫" },
    { key: "트롬본", name: "트롬본" },
    { key: "유포니움", name: "유포니움" },
    { key: "튜바", name: "튜바" },
    { key: "타악기", name: "타악기" },
    { key: "교회", name: "교회" },
    { key: "합창", name: "합창" },
    { key: "콘체르토", name: "콘체르토" },
  ],
  price: [
    { key: "ASC", name: "가격 낮은 순" },
    { key: "DESC", name: "가격 높은 순" },
  ],
};

export { constants, boxes };
