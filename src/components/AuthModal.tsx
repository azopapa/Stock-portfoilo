import React, { useState } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';
import { Lock, Mail, User, ArrowRight, ShieldCheck, Settings, X, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  onSuccess: (user: any) => void;
  onOpenConfig: () => void;
  isConfigured: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccess,
  onOpenConfig,
  isConfigured,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMsg('Supabase 설정이 완료되지 않았습니다. 먼저 설정을 진행해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          if (data.session) {
            onSuccess(data.user);
          } else {
            setSuccessMsg('회원가입이 완료되었습니다! 이메일 인증 후 로그인해주세요.');
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onSuccess(data.user);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 과정에서 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="px-6 py-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                {isSignUp ? 'Supabase 회원가입' : '포트폴리오 로그인'}
              </h2>
              <p className="text-xs text-zinc-400">안전한 자산 관리를 위해 로그인해주세요</p>
            </div>
          </div>

          <button
            onClick={onOpenConfig}
            className="p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-medium"
            title="Supabase 설정"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">설정</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 relative z-10">
          {!isConfigured && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Supabase 연동이 필요합니다</p>
                <p className="text-amber-300/80 mb-2">우측 상단 <b>[설정]</b> 버튼을 눌러 프로젝트 URL과 Anon Key를 입력해주세요.</p>
                <button
                  type="button"
                  onClick={onOpenConfig}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 font-semibold text-amber-200 text-[11px]"
                >
                  지금 설정하기 &rarr;
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
              {successMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">이메일 주소</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{loading ? '처리 중...' : isSignUp ? '회원가입 완료' : '로그인하기'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
