import React, { useState, useEffect } from 'react';
import { ResearchNote, StockItem } from '../types';
import { getSupabaseClient } from '../lib/supabaseClient';
import { FileText, Plus, Trash2, Edit3, Save, X, Lock, Code, Sparkles, CheckCircle2 } from 'lucide-react';

interface ResearchNotesSectionProps {
  user: any;
  stocks: StockItem[];
}

export const ResearchNotesSection: React.FC<ResearchNotesSectionProps> = ({ user, stocks }) => {
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [stockId, setStockId] = useState<string>('');
  const [showSqlModal, setShowSqlModal] = useState(false);

  const fetchNotes = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('research_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      if (data) {
        setNotes(data as ResearchNote[]);
      }
    } catch (err: any) {
      console.error('Failed to fetch research notes', err);
      setErrorMsg(
        '메모를 불러오지 못했습니다. Supabase에 research_notes 테이블이 생성되어 있는지 확인해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      alert('Supabase 클라이언트가 초기화되지 않았습니다.');
      return;
    }

    try {
      if (currentId) {
        // 수정
        const { error } = await supabase
          .from('research_notes')
          .update({
            title,
            content,
            stock_id: stockId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentId);

        if (error) throw error;
        setSuccessMsg('연구원 메모가 성공적으로 수정되었습니다.');
      } else {
        // 생성
        const { error } = await supabase.from('research_notes').insert([
          {
            user_id: user.id,
            title,
            content,
            stock_id: stockId || null,
          },
        ]);

        if (error) throw error;
        setSuccessMsg('새로운 연구원 메모가 안전하게 저장되었습니다.');
      }

      resetForm();
      fetchNotes();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Save note error:', err);
      alert('저장 실패: ' + (err.message || '알 수 없는 오류가 발생했습니다.'));
    }
  };

  const handleEdit = (note: ResearchNote) => {
    setCurrentId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setStockId(note.stock_id || '');
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 이 메모를 삭제하시겠습니까?')) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase.from('research_notes').delete().eq('id', id);
      if (error) throw error;
      setSuccessMsg('메모가 삭제되었습니다.');
      fetchNotes();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('삭제 실패: ' + err.message);
    }
  };

  const resetForm = () => {
    setCurrentId(null);
    setTitle('');
    setContent('');
    setStockId('');
    setIsEditing(false);
  };

  const sqlQueryExample = `-- 1. 연구원 비공개 메모 테이블 생성
create table if not exists public.research_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  title text not null,
  content text not null,
  stock_id text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Row Level Security (RLS) 활성화
alter table public.research_notes enable row level security;

-- 3. 본인 소유의 메모만 조회, 삽입, 수정, 삭제 가능하도록 보안 정책 설정
create policy "Users can manage their own research notes"
  on public.research_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`;

  return (
    <section className="mt-12 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>연구원 비공개 메모장</span>
            <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> 본인만 열람 가능 (RLS 보안)
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            포트폴리오 종목 및 분석에 대한 연구원 전용 비공개 기록 공간입니다. 데이터는 Supabase에 안전하게 저장됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700"
          >
            <Code className="w-4 h-4 text-emerald-400" />
            <span>Supabase SQL 쿼리 보기</span>
          </button>
          {!isEditing && (
            <button
              onClick={() => {
                resetForm();
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/50"
            >
              <Plus className="w-4 h-4" />
              <span>새 메모 작성</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold mb-0.5">테이블 생성 필요 안내</p>
            <p className="text-rose-300/80">{errorMsg}</p>
          </div>
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 font-semibold rounded-lg text-[11px] shrink-0"
          >
            SQL 쿼리 확인하기 &rarr;
          </button>
        </div>
      )}

      {/* 작성/수정 폼 */}
      {isEditing && (
        <form onSubmit={handleSaveNote} className="mb-6 bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-200">
              {currentId ? '메모 수정하기' : '새 연구원 메모 작성'}
            </h3>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsEditing(false);
              }}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">메모 제목</label>
              <input
                type="text"
                required
                placeholder="예: 반도체 섹터 비중 확대 전략"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">관련 종목 연결 (선택)</label>
              <select
                value={stockId}
                onChange={(e) => setStockId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- 특정 종목 선택 안 함 --</option>
                {stocks.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.ticker})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">메모 내용 및 분석 인사이트</label>
            <textarea
              required
              rows={4}
              placeholder="연구원 개인의 투자 아이디어, 리스크 요인, 목표가 산정 근거 등을 기록하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsEditing(false);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{currentId ? '수정 사항 저장' : '비공개 메모 저장'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 메모 목록 */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-xs">메모를 불러오는 중입니다...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 bg-zinc-950/40 rounded-xl border border-zinc-800/80">
          <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-300">작성된 연구원 메모가 없습니다</p>
          <p className="text-xs text-zinc-500 mt-1">상단의 "새 메모 작성" 버튼을 눌러 첫 번째 기록을 남겨보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => {
            const linkedStock = stocks.find((s) => s.id === note.stock_id);
            return (
              <div
                key={note.id}
                className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {linkedStock && (
                    <div className="mb-2">
                      <span className="inline-block text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded font-mono">
                        관련 종목: {linkedStock.name} ({linkedStock.ticker})
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed mb-4">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-3 border-t border-zinc-900">
                  <span>작성일: {new Date(note.created_at).toLocaleDateString('ko-KR')}</span>
                  <span className="flex items-center gap-1 text-emerald-400/80">
                    <Lock className="w-3 h-3" /> 비공개
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SQL Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">Supabase SQL Editor 실행 쿼리</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-300">
                Supabase 대시보드의 <b className="text-emerald-400">SQL Editor</b> 메뉴로 이동하여 아래 쿼리를 실행하시면 연구원 비공개 메모 기능용 테이블과 RLS(행 수준 보안) 정책이 즉시 생성됩니다.
              </p>

              <div className="relative">
                <pre className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-80 select-all">
                  {sqlQueryExample}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlQueryExample);
                    alert('SQL 쿼리가 클립보드에 복사되었습니다!');
                  }}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium transition-colors border border-zinc-700"
                >
                  복사하기
                </button>
              </div>

              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-300">🔒 RLS(Row Level Security) 안내</p>
                <p>
                  위 쿼리는 Supabase의 행 수준 보안(RLS)을 적용하여, 로그인한 연구원 본인(<code className="text-emerald-400">auth.uid() = user_id</code>)의 메모 데이터만 조회 및 수정할 수 있도록 완벽히 보호합니다.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium"
                >
                  확인 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
