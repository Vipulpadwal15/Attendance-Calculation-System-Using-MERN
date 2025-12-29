import React from 'react';
import { Card } from 'antd';

function StatCard({ title, value, loading, color, icon }) {
    return (
        <Card
            bordered={false}
            loading={loading}
            style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                borderRadius: '0.5rem',
                overflow: 'hidden'
            }}
            bodyStyle={{ padding: '24px' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {title}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '1.875rem', fontWeight: 700, color: color || '#111827' }}>
                        {value}
                    </p>
                </div>
                {icon && (
                    <div style={{ padding: '12px', borderRadius: '50%', background: `${color}20` || '#f3f4f6' }}>
                        {React.cloneElement(icon, { style: { fontSize: '24px', color: color || '#6B7280' } })}
                    </div>
                )}
            </div>
        </Card>
    );
}

export default StatCard;
