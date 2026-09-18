/**
 * 상영회 데이터
 * - 실제 정보가 확정되면 아래 값만 교체하면 됩니다.
 * - thumbnail / illustration / webtoonImages 를 null로 두면 자동으로 장식 플레이스홀더가 표시됩니다.
 * - videoUrl 은 유튜브 videoId 문자열입니다. (현재는 블렌더 재단의 공개 라이선스 영상으로 임시 대체 — 실제 작품 영상으로 교체 필요)
 * - 지금은 다른 사람에게 데모로 보여주기 위해 제목/설명/팀원/러닝타임을 전부 플레이스홀더(작품 -N, 학생-N, 00:00)로 단순화한 상태입니다.
 */
window.SHOWCASE_DATA = {
  hero: {
    title: "DRAWN TO THE SPOTLIGHT",
    subtitle: "2026 Animation & Webtoon Graduation Showcase",
    creditLine: "Starring Us.",
    edition: "제23회 졸업작품 상영회",
    period: "2026. 10. 12 (월)",
    posterImage: "assets/hero-poster.svg"
  },
  contact: {
    department: "유한대학교 방송미디어학과 애니메이션웹툰전공",
    website: "https://anima.yuhan.ac.kr/index.do",
    instagram: "https://www.instagram.com/yuhan.ani/"
  },
  faculty: {
    greeting: {
      name: "강현종",
      title: "학과장",
      paragraphs: ["학과장 인사말"]
    },
    groups: [
      { label: "학과장", names: ["강현종"] },
      { label: "지도교수", names: ["안현숙", "강효은", "이문형", "박정선", "채범석", "김미경", "김종훈", "류명희", "안형혜", "오필정", "안민채", "이지웅", "정예진"] }
    ]
  },
  teams: [
    { order: 1, title: "작품 -1 제목", genre: "2D 애니메이션", synopsis: "작품 -1 설명", runtime: "00:00", mediaType: "video", videoUrl: "YE7VzlLtp-4", thumbnail: null,
      members: makeMembers(1) },
    { order: 2, title: "작품 -2 제목", genre: "2D 애니메이션", synopsis: "작품 -2 설명", runtime: "00:00", mediaType: "video", videoUrl: "YE7VzlLtp-4", thumbnail: null,
      members: makeMembers(2) },
    { order: 3, title: "작품 -3 제목", genre: "2D 애니메이션", synopsis: "작품 -3 설명", runtime: "00:00", mediaType: "video", videoUrl: "eRsGyueVLvQ", thumbnail: null,
      members: makeMembers(3) },
    { order: 4, title: "작품 -4 제목", genre: "2D 애니메이션", synopsis: "작품 -4 설명", runtime: "00:00", mediaType: "video", videoUrl: "eRsGyueVLvQ", thumbnail: null,
      members: makeMembers(4) },
    { order: 5, title: "작품 -5 제목", genre: "2D 애니메이션", synopsis: "작품 -5 설명", runtime: "00:00", mediaType: "video", videoUrl: "eRsGyueVLvQ", thumbnail: null,
      members: makeMembers(5) },
    { order: 6, title: "작품 -6 제목", genre: "2D 애니메이션", synopsis: "작품 -6 설명", runtime: "00:00", mediaType: "video", videoUrl: "YE7VzlLtp-4", thumbnail: null,
      members: makeMembers(6) },
    { order: 7, title: "작품 -7 제목", genre: "2D 애니메이션", synopsis: "작품 -7 설명", runtime: "00:00", mediaType: "video", videoUrl: "eRsGyueVLvQ", thumbnail: null,
      members: makeMembers(7) },
    { order: 8, title: "작품 -8 제목", genre: "2D 애니메이션", synopsis: "작품 -8 설명", runtime: "00:00", mediaType: "video", videoUrl: "YE7VzlLtp-4", thumbnail: null,
      members: makeMembers(8) },
    { order: 9, title: "작품 -9 제목", genre: "2D 애니메이션", synopsis: "작품 -9 설명", runtime: "00:00", mediaType: "video", videoUrl: "eRsGyueVLvQ", thumbnail: null,
      members: makeMembers(9) },
    { order: 10, title: "작품 -10 제목", genre: "3D 애니메이션", synopsis: "작품 -10 설명", runtime: "00:00", mediaType: "video", videoUrl: "YE7VzlLtp-4", thumbnail: null,
      members: makeMembers(10) },
    { order: 11, title: "작품 -11 제목", genre: "3D 애니메이션", synopsis: "작품 -11 설명", runtime: "00:00", mediaType: "video", videoUrl: "eRsGyueVLvQ", thumbnail: null,
      members: makeMembers(11) },
    { order: 12, title: "작품 -12 제목", genre: "웹툰", synopsis: "작품 -12 설명", runtime: "00:00", mediaType: "video+webtoon", videoUrl: "YE7VzlLtp-4", thumbnail: null,
      webtoonPrompt: "웹툰 감상하기", webtoonImages: null, webtoonCutCount: 8,
      members: makeMembers(12) }
  ]
};

/** 팀당 학생 5명(학생-1~5), 역할은 감독·작화·배경·편집·사운드. 아바타는 전체 인원 기준으로 6종을 이어서 순환 배정. */
function makeMembers(teamIndex) {
  const roles = ["감독", "작화", "배경", "편집", "사운드"];
  const avatarCount = 6;
  const startGlobalIndex = (teamIndex - 1) * 5;
  const members = [];
  for (let i = 0; i < 5; i++) {
    const studentNum = i + 1;
    const globalIndex = startGlobalIndex + i;
    const avatarNum = (globalIndex % avatarCount) + 1;
    members.push({
      name: `학생-${studentNum}`,
      role: roles[i],
      bio: `학생-${studentNum} 한마디`,
      illustration: `assets/members/avatar-${avatarNum}.svg`
    });
  }
  return members;
}
