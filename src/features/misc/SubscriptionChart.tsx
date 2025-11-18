import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import ReactSelect from 'react-select';
import reactSelectStylesConfig from '@/lib/react-select';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { axios } from '@/lib/axios';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface SubscriptionStatsResponse {
    dates: string[];
    free: number[];
    monthly: number[];
    yearly: number[];
    totals: number[];
    paid: number[];
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        fill: boolean;
        tension: number;
    }[];
}

const SubscriptionChart: React.FC = () => {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [dateFilter, setDateFilter] = useState<{ value: string; label: string }>({
        value: 'currentMonth',
        label: 'Current Month',
    });

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStartDate, setSelectedStartDate] = useState('');
    const [selectedEndDate, setSelectedEndDate] = useState('');
    const [cumulativeTotals, setCumulativeTotals] = useState<number[]>([]);
    const getDateLabel = (): string => {
        switch (dateFilter.value) {
            case 'today':
                return dayjs().format('MM/DD/YYYY');
            case 'currentWeek':
                return `${dayjs().startOf('week').format('MM/DD/YYYY')} - ${dayjs().endOf('week').format('MM/DD/YYYY')}`;
            case 'currentMonth':
                return dayjs().format('MMMM YYYY');
            case 'lastMonth':
                return dayjs().subtract(1, 'month').format('MMMM YYYY');
            case 'currentYear':
                return dayjs().format('YYYY');
            case 'lastYear':
                return dayjs().subtract(1, 'year').format('YYYY');
            case 'allTime':
                return 'All Time';
            case 'date':
                return selectedDate ? dayjs(selectedDate).format('MM/DD/YYYY') : '';
            case 'dateRange':
                return selectedStartDate && selectedEndDate
                    ? `${dayjs(selectedStartDate).format('MM/DD/YYYY')} - ${dayjs(selectedEndDate).format('MM/DD/YYYY')}`
                    : '';
            default:
                return '';
        }
    };

    const getChartTitle = () => `Users Subscriptions${getDateLabel() ? ` (${getDateLabel()})` : ''}`;
    const getYAxisLabel = () => `# of Users${getDateLabel() ? ` (${getDateLabel()})` : ''}`;
    const getXAxisLabel = () => `Date${getDateLabel() ? ` (${getDateLabel()})` : ''}`;

    const handleDateFilterChange = (option: any) => {
        setDateFilter(option);

        if (option.value === 'date') {
            setSelectedDate('');
        } else if (option.value === 'dateRange') {
            setSelectedStartDate('');
            setSelectedEndDate('');
        } else {
            fetchSubscriptionStats(option.value);
        }
    };

    const handleSingleDateBlur = () => {
        if (!selectedDate) return;
        const formatted = dayjs(selectedDate).format('YYYY-MM-DD');
        fetchSubscriptionStats('date', formatted, formatted);
    };

    const handleDateRangeBlur = () => {
        if (selectedStartDate && selectedEndDate) {
            const start = dayjs(selectedStartDate).format('YYYY-MM-DD');
            const end = dayjs(selectedEndDate).format('YYYY-MM-DD');

            if (dayjs(start).isAfter(dayjs(end))) {
                alert('Start date must be before end date');
                return;
            }
            fetchSubscriptionStats('dateRange', start, end);
        }
    };

    const fetchSubscriptionStats = async (filterType?: string,startDate?: string,endDate?: string) => {
        try {
            setLoading(true);
            let params: any = {};

            if (filterType === 'date' && startDate) {
                params = {
                    filterType: 'date',
                    date: startDate
                };
            } else if (filterType === 'dateRange' && startDate && endDate) {
                params = {
                    filterType: 'dateRange',
                    startDate: startDate,
                    endDate: endDate
                };
            } else if (filterType) {
                params = { filterType };
            }

            const response = await axios.get<SubscriptionStatsResponse>('/users/subscription-stats',{ params });

            const { dates, free, monthly, yearly, paid, totals } = response.data;
            setCumulativeTotals(totals);

            setChartData({
                labels: dates,
                datasets: [
                    {
                        label: 'Free',
                        data: free,
                        borderColor: 'rgb(148, 163, 184)',
                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Paid',
                        data: paid,
                        borderColor: 'rgba(246, 59, 174, 1)',
                        backgroundColor: 'rgba(255, 42, 0, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Monthly',
                        data: monthly,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Yearly',
                        data: yearly,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching subscription stats:', err);
            setError('Failed to load subscription data');
            setLoading(false);
        }
    };
    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: getChartTitle(),
                font: { size: 16, weight: 'bold' },
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                callbacks: {
                    title: (tooltipItems) => {
                        return tooltipItems[0].label;
                    },
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y || 0;
                        return `  ${label}: ${value.toLocaleString()}`;
                    },
                    footer: (tooltipItems) => {
                        const index = tooltipItems[0].dataIndex;
                        const total = cumulativeTotals[index] || 0;
                        return `─────────────────\n  Total Users: ${total.toLocaleString()}`;
                    },
                },
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#F3F4F6',
                bodyColor: '#E5E7EB',
                footerColor: '#60A5FA',
                titleFont: { size: 13, weight: 'normal' },
                bodyFont: { size: 13 },
                footerFont: { size: 14, weight: 'bold' },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                footerMarginTop: 8,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: getYAxisLabel() },
                ticks: { stepSize: 1 },
            },
            x: {
                title: { display: true, text: getXAxisLabel() },
            },
        },
        interaction: { mode: 'index', axis: 'x', intersect: false },
    };
    useEffect(() => {
        fetchSubscriptionStats('currentMonth');
    }, []);
    if (loading)
        return (
            <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow">
                <p className="text-gray-500">Loading chart...</p>
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow">
                <p className="text-red-500">{error}</p>
            </div>
        );

    if (!chartData)
        return (
            <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    return (
        <div className="w-full h-[600px] bg-white p-6 rounded-lg shadow flex flex-col">
            <div className="flex justify-end items-center mb-4 gap-3">
                <ReactSelect
                    styles={reactSelectStylesConfig}
                    className="w-56"
                    placeholder="Select period"
                    name="dateFilter"
                    options={[
                        { value: 'today', label: 'Today' },
                        { value: 'currentWeek', label: 'Current Week' },
                        { value: 'currentMonth', label: 'Current Month' },
                        { value: 'lastMonth', label: 'Last Month' },
                        { value: 'currentYear', label: 'Current Year' },
                        { value: 'lastYear', label: 'Last Year' },
                        { value: 'allTime', label: 'All Time' },
                        { value: 'date', label: 'Date' },
                        { value: 'dateRange', label: 'Date Range' },
                    ]}
                    value={dateFilter}
                    onChange={handleDateFilterChange}
                />

                {dateFilter.value === 'date' && (
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        onBlur={handleSingleDateBlur}
                        onKeyDown={(e) => e.key === 'Enter' && handleSingleDateBlur()}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
                    />
                )}

                {dateFilter.value === 'dateRange' && (
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={selectedStartDate}
                            onChange={(e) => setSelectedStartDate(e.target.value)}
                            onBlur={handleDateRangeBlur}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={selectedEndDate}
                            onChange={(e) => setSelectedEndDate(e.target.value)}
                            onBlur={handleDateRangeBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleDateRangeBlur()}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}
            </div>

            <div className="flex-1">
                <Line options={options} data={chartData} />
            </div>
            <div className="flex justify-center items-center gap-6 pt-6 border-t mt-4">
                {(() => {
                    const datasetLatest = chartData.datasets
                        .filter(ds => ds.label?.toLowerCase() !== 'paid')
                        .map(ds => {
                            const last = ds.data.length ? ds.data[ds.data.length - 1] : 0;
                            return typeof last === 'number' ? last : Number(last || 0);
                        });

                    const currentTotal = datasetLatest.reduce((a, b) => a + b, 0);
                    console.log(datasetLatest)
                    const items = [
                        { label: 'Total Free', color: 'text-slate-500',  latest: datasetLatest[0] },
                        { label: 'Total Monthly', color: 'text-blue-500', latest: datasetLatest[1] },
                        { label: 'Total Yearly', color: 'text-green-500', latest: datasetLatest[2] },
                    ];

                    return (
                        <>
                            {items.map((item, idx) => (
                                <React.Fragment key={item.label}>
                                    {idx > 0 && <span className="text-2xl text-gray-400 font-light">+</span>}
                                    <div className="text-center">
                                        <p className={`text-3xl font-bold ${item.color}`}>
                                            {item.latest}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">{item.label}</p>
                                    </div>
                                </React.Fragment>
                            ))}

                            <span className="text-2xl text-gray-400 font-light">=</span>

                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-800">
                                    {currentTotal}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Total Users</p>
                            </div>
                        </>
                    );
                })()}
            </div>

        </div>
    );
};

export default SubscriptionChart;
