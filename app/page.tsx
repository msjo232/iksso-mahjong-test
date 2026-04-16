"use client";

import { useEffect, useState } from "react";

const API = "/api/mahjong";

type Schedule = {
  nickname: string;
  start: string;
  end: string;
};

export default function Page() {
  const [date, setDate] = useState("2026-04-15");
  const [members, setMembers] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [selectedMember, setSelectedMember] = useState("");
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    load();
  }, [date]);

  async function load() {
    const m = await fetch(`${API}?action=members`).then(r => r.json());
    setMembers(m.members.map((v: any) => v.nickname));

    const s = await fetch(`${API}?action=schedules&date=${date}`).then(r => r.json());
    setSchedules(s.schedules || []);
  }

  /* =========================
     시간 변환 (30분 단위)
  ========================= */

  function snap(px: number) {
    const minutes = Math.round((px * 2) / 30) * 30;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function toTop(time: string) {
    const [h, m] = time.split(":").map(Number);
    return (h * 60 + m) / 2;
  }

  function toHeight(start: string, end: string) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 2;
  }

  /* =========================
     터치 드래그
  ========================= */

  function handlePointerDown(e: any) {
    if (!selectedMember) {
      alert("닉네임 선택 먼저");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    setDragStart(y);
    setDragEnd(y);
  }

  function handlePointerMove(e: any) {
    if (dragStart === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    setDragEnd(y);

    const start = snap(Math.min(dragStart, y));
    const end = snap(Math.max(dragStart, y));

    setPreview({ start, end });
  }

  function handlePointerUp() {
    if (!preview) return;
  }

  /* =========================
     저장
  ========================= */

  async function saveSchedule() {
    if (!preview || !selectedMember) return;

    await fetch(API, {
      method: "POST",
      body: JSON.stringify({
        action: "saveSchedule",
        nickname: selectedMember,
        date,
        start: preview.start,
        end: preview.end,
        table: "1탁"
      })
    });

    setDragStart(null);
    setDragEnd(null);
    setPreview(null);

    load();
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="p-3">
      <h1 className="text-lg font-bold mb-2">마작 타임라인</h1>

      {/* 닉네임 선택 */}
      <select
        className="w-full mb-3 p-2 border"
        value={selectedMember}
        onChange={(e) => setSelectedMember(e.target.value)}
      >
        <option value="">닉네임 선택</option>
        {members.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>

      {/* 타임라인 */}
      <div
        className="relative border h-[720px] touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* 시간 라인 */}
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full border-t text-[10px] text-gray-400"
            style={{ top: i * 30 }}
          >
            {String(i).padStart(2, "0")}:00
          </div>
        ))}

        {/* 기존 일정 */}
        {schedules.map((s, i) => (
          <div
            key={i}
            className="absolute left-2 w-28 bg-green-400 text-xs rounded"
            style={{
              top: toTop(s.start),
              height: toHeight(s.start, s.end)
            }}
          >
            {s.nickname}
          </div>
        ))}

        {/* 드래그 영역 */}
        {dragStart !== null && dragEnd !== null && (
          <div
            className="absolute left-0 w-full bg-yellow-300 opacity-40"
            style={{
              top: Math.min(dragStart, dragEnd),
              height: Math.abs(dragEnd - dragStart)
            }}
          />
        )}
      </div>

      {/* 바텀시트 */}
      {preview && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4">
          <div className="text-center mb-2">
            ⏰ {preview.start} ~ {preview.end}
          </div>

          <button
            className="w-full bg-blue-500 text-white p-3 rounded mb-2"
            onClick={saveSchedule}
          >
            저장
          </button>

          <button
            className="w-full border p-3 rounded"
            onClick={() => setPreview(null)}
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
