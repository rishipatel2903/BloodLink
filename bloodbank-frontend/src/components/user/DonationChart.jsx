import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const DonationChart = ({ data }) => {
    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel p-3 border border-white/10 rounded-lg shadow-xl bg-black/90">
                    <p className="text-white font-bold mb-1">{label}</p>
                    <p className="text-neon-red text-sm">
                        🩸 {payload[0].value} Units Donated
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#6b7280"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar
                        dataKey="units"
                        fill="#ff073a"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DonationChart;
