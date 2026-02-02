const coupons = [
    {
        code: 'SDE2026',
        discount: 500,
        isPercentage: false,
        expiryDate: new Date('2026-12-31'),
    },
    {
        code: 'WELCOME10',
        discount: 10,
        isPercentage: true,
        expiryDate: new Date('2026-12-31'),
    },
    {
        code: 'ANTIGRAVITY',
        discount: 99,
        isPercentage: true,
        expiryDate: new Date('2026-12-31'),
    },
];

export default coupons;
