// 기획서 "확인 필요 사항"에 해당하는 값들. 결정되면 여기서만 바꾼다.

/** 메모 글자 수 제한 (한마디보다 넉넉하게) */
export const MEMO_MAX_LENGTH = 300;

/** 메인 페이지 노출 최소 스크랩 수 (소수 사용자 행동 추정 방지) */
export const MIN_SCRAP_COUNT = 3;

/** 내 스크랩 목록 한 페이지에 보여줄 개수 */
export const SCRAP_PAGE_SIZE = 10;

/** 랭킹 목록당 최대 노출 개수 (10위까지, 5개씩 2페이지) */
export const RANKING_SIZE = 10;

/** 랭킹 한 페이지에 보여줄 개수 */
export const RANKING_PAGE_SIZE = 5;

/** 이 개수 이상일 때만 좌우 페이징 버튼을 보여준다. 미만이면 상위 5개만 노출. */
export const RANKING_PAGING_MIN = 10;

/** 스크랩 폴더 이름 최대 글자 수 */
export const FOLDER_NAME_MAX_LENGTH = 20;

/** PoC용 로그인 사용자. 실제 인증 연동 전까지 고정값. */
export const CURRENT_USER_ID = "me";

/** '스크랩 하는 법(임시)' 안내 화면에 띄울 목업 기사 */
export const GUIDE_ARTICLE_ID = "a17";
