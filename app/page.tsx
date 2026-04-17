// page_v2.tsx
// 간단 안정 버전 (시간입력 + 선택 + 카톡복사 + 내일정 필터)

import { useEffect, useMemo, useState } from "react";

const API = "/api/mahjong";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function isSameOrAfterToday(date) {
  return date >= getToday();
}

export default function Page() {
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(getToday());
  const [currentUser, setCurrentUser] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch(`${API}?action=members`)
      .then(res => res.json())
      .then(data => setMembers(data.members || []));
  }, []);

  useEffect(() => {
    fetch(`${API}?action=schedules&date=${date}`)
      .then(res => res.json())
      .then(data => setEntries(data.schedules || []));
  }, [date]);

  const myEntries = useMemo(() => {
    return currentUser
      ? entries
          .filter(e => e.nickname === currentUser && isSameOrAfterToday(e.date))
          .sort((a, b) => a.start.localeCompare(b.start))
      : [];
  }, [entries, currentUser]);

  function copyKakao(list) {
    if (list.length === 0) return;

    const names = list.map(e => e.nickname).join(", ");
    const text = `🀄 익쏘 마작 모집

📅 ${date}
🕒 ${list[0].start} ~ ${list[0].end}

참여 가능:
${names}

참여하실 분은 일정 등록해주세요!`;

    navigator.clipboard.writeText(text);
    alert("카톡 복사 완료!");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>익쏘 마작 일정</h2>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      <select
        value={currentUser}
        onChange={e => setCurrentUser(e.target.value)}
      >
        <option value="">회원 선택</option>
        {members.map(m => (
          <option key={m.nickname}>{m.nickname}</option>
        ))}
      </select>

      <hr />

      <h3>타임라인</h3>
      {entries.map(e => (
        <div
          key={e.id}
          onClick={() =>
            setSelected(prev =>
              prev.includes(e)
                ? prev.filter(x => x !== e)
                : [...prev, e]
            )
          }
          style={{
            padding: 10,
            margin: 5,
            border: "1px solid #ccc",
            background: selected.includes(e) ? "#ffeaa7" : "#fff",
            cursor: "pointer",
          }}
        >
          {e.nickname} {e.start}~{e.end} {e.memo}
        </div>
      ))}

      <button onClick={() => copyKakao(selected)}>카톡 복사</button>

      <hr />

      <h3>내 일정</h3>
      {myEntries.length === 0 && <div>오늘 이후 일정 없음</div>}
      {myEntries.map(e => (
        <div key={e.id}>
          {e.date} {e.start}~{e.end}
        </div>
      ))}
    </div>
  );
}
