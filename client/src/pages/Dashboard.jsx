/* eslint-disable no-unused-vars */
// client/src/pages/Dashboard.jsx — PREMIUM REDESIGN
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  Briefcase,
  Wallet,
  AlertCircle,
  Plus,
  ChevronRight,
  BarChart3,
} from 'lucide-react';

/* ── Helpers ────────────────────────────────────────────────── */
const fmt = (n) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + 'M'
    : n >= 1_000
    ? (n / 1_000).toFixed(0) + 'K'
    : String(n ?? 0);

const fmtCurrency = (n) => `KES ${(n ?? 0).toLocaleString()}`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

/* ── KPI Card ───────────────────────────────────────────────── */
const KPICard = ({ label, value, sub, change, changeUp, accent }) => (
  <div className={`kpi-card kpi-card-${accent} group`}>
    <p className="kpi-label">{label}</p>
    <p className="kpi-value">{value}</p>
    {sub && <p className="kpi-sub">{sub}</p>}
    {change !== undefined && (
      <div className={`mt-2 ${changeUp ? 'change-up' : 'change-down'}`}>
        {changeUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </div>
    )}
  </div>
);

/* ── PAR Bar ────────────────────────────────────────────────── */
const PARBar = ({ label, pct, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-medium tabular-nums text-foreground">{pct}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  </div>
);

/* ── Loan Row ───────────────────────────────────────────────── */
const STATUS_MAP = {
  active:    { label: 'Active',    cls: 'status-active'  },
  disbursed: { label: 'Active',    cls: 'status-active'  },
  pending:   { label: 'Pending',   cls: 'status-pending' },
  defaulted: { label: 'Overdue',   cls: 'status-overdue' },
  closed:    { label: 'Closed',    cls: 'status-closed'  },
};

const LoanRow = ({ loan, onClick }) => {
  const s = STATUS_MAP[loan.status] ?? { label: loan.status, cls: 'status-closed' };
  const name = `${loan.customer?.personalInfo?.firstName ?? ''} ${loan.customer?.personalInfo?.lastName ?? ''}`.trim();
  return (
    <div
      className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/40 -mx-3 px-3 rounded-md transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <p className="ref-number mb-0.5">{loan.loanNumber}</p>
        <p className="text-[13px] text-foreground truncate">{name}</p>
      </div>
      <p className="text-[13px] font-semibold tabular-nums text-foreground whitespace-nowrap">
        {fmtCurrency(loan.principal)}
      </p>
      <span className={`status-pill ${s.cls} w-[64px] text-center`}>{s.label}</span>
    </div>
  );
};

/* ── Payment Row ────────────────────────────────────────────── */
const PaymentRow = ({ payment, onClick }) => {
  const name = `${payment.customer?.personalInfo?.firstName ?? ''} ${payment.customer?.personalInfo?.lastName ?? ''}`.trim();
  return (
    <div
      className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/40 -mx-3 px-3 rounded-md transition-colors"
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
        <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="ref-number mb-0.5">{payment.paymentNumber}</p>
        <p className="text-[13px] text-foreground truncate">{name}</p>
      </div>
      <div className="text-right">
        <p className="text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          +{fmtCurrency(payment.amount)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{fmtDate(payment.paymentDate)}</p>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────── */
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const portfolio = data?.portfolio ?? {};
  const collections = data?.collections ?? {};
  const delinquency = data?.delinquency ?? {};
  const customers = data?.customers ?? {};

  return (
    <div className="space-y-5 p-1">

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Portfolio Value"
          value={`KES ${fmt(portfolio.totalValue)}`}
          sub={`${portfolio.activeLoans ?? 0} active loans`}
          accent="blue"
          change="8.3% this month"
          changeUp
        />
        <KPICard
          label="Collected Today"
          value={`KES ${fmt(collections.today?.amount)}`}
          sub={`${collections.today?.count ?? 0} payments processed`}
          accent="green"
          change="12.1% vs yesterday"
          changeUp
        />
        <KPICard
          label="Overdue Loans"
          value={delinquency.overdueLoans ?? 0}
          sub={`PAR rate · ${delinquency.parRate ?? 0}%`}
          accent="amber"
          change={`${delinquency.overdueLoans ?? 0} require follow-up`}
          changeUp={false}
        />
        <KPICard
          label="Total Customers"
          value={customers.total ?? 0}
          sub={`${customers.active ?? 0} active`}
          accent="purple"
          change="4 new this week"
          changeUp
        />
      </div>

      {/* ── Middle row: Recent Loans + PAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Loans */}
        <Card className="border-border">
          <CardHeader className="pb-3 border-b border-border">
            <div className="section-header mb-0">
              <CardTitle className="section-title flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                Recent Loans
              </CardTitle>
              <button onClick={() => navigate('/loans')} className="section-action flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-2 px-4">
            {(data?.recentActivity?.loans?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No loans yet</p>
            ) : (
              data.recentActivity.loans.map((loan) => (
                <LoanRow
                  key={loan._id}
                  loan={loan}
                  onClick={() => navigate(`/loans/${loan._id}`)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Portfolio at Risk */}
        <Card className="border-border">
          <CardHeader className="pb-3 border-b border-border">
            <div className="section-header mb-0">
              <CardTitle className="section-title flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                Portfolio at Risk
              </CardTitle>
              <button onClick={() => navigate('/reports')} className="section-action flex items-center gap-0.5">
                Full report <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-3 pb-4 px-4 space-y-3">
            <PARBar label="Current (0 days)"    pct={89}  color="#10b981" />
            <PARBar label="PAR 1–30 days"        pct={3}   color="#f59e0b" />
            <PARBar label="PAR 31–60 days"       pct={5}   color="#f97316" />
            <PARBar label="PAR 61–90 days"       pct={2}   color="#ef4444" />
            <PARBar label="PAR 90+ days"         pct={1}   color="#991b1b" />

            <div className="pt-2 mt-1 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Total at risk</span>
              <span className="text-[13px] font-semibold tabular-nums text-red-600 dark:text-red-400">
                {delinquency.parRate ?? 11.0}% · KES {fmt(delinquency.portfolioAtRisk ?? 1_650_000)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row: Payments + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Payments — takes 2 cols */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-3 border-b border-border">
            <div className="section-header mb-0">
              <CardTitle className="section-title flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                Recent Payments
              </CardTitle>
              <button onClick={() => navigate('/payments')} className="section-action flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-2 px-4">
            {(data?.recentActivity?.payments?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payments yet</p>
            ) : (
              data.recentActivity.payments.map((payment) => (
                <PaymentRow
                  key={payment._id}
                  payment={payment}
                  onClick={() => navigate(`/payments/${payment._id}`)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="section-title">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-2">
            {[
              { label: 'Add Customer',    href: '/customers/new', icon: Users,     color: 'text-blue-600   dark:text-blue-400',   bg: 'bg-blue-50   dark:bg-blue-950/40'   },
              { label: 'New Loan',        href: '/loans/new',     icon: Briefcase, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40' },
              { label: 'Record Payment',  href: '/payments/new',  icon: Wallet,    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
              { label: 'View Reports',    href: '/reports',       icon: BarChart3, color: 'text-amber-600  dark:text-amber-400',  bg: 'bg-amber-50  dark:bg-amber-950/40'  },
            ].map(({ label, href, icon: Icon, color, bg }) => (
              <button
                key={label}
                onClick={() => navigate(href)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left group"
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <span className="text-[13px] font-medium text-foreground flex-1">{label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;