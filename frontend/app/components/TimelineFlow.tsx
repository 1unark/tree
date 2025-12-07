import React, { useState, useRef } from 'react';

const sampleData = {
  mainTimeline: [
    { id: 'm1', date: new Date(2000, 0, 1), title: "Born", content: "Entered the world on a cold January morning." },
    { id: 'm2', date: new Date(2005, 8, 1), title: "Started School", content: "First day of elementary school. Big milestone." },
    { id: 'm3', date: new Date(2016, 5, 15), title: "College Graduation", content: "BS in Computer Science. Ready for the world." },
    { id: 'm4', date: new Date(2018, 7, 20), title: "Got Married", content: "Best day of my life with Sarah." },
    { id: 'm5', date: new Date(2022, 2, 10), title: "Became a Parent", content: "Lily was born. Everything changed." },
  ],
  branches: [
    {
      id: 1,
      name: "Education",
      x: 400,
      collapsed: false,
      color: "#2563eb",
      entries: [
        { id: 1, date: new Date(2005, 8, 15), title: "First Week", content: "Learning to read and write. Made friends with Sarah." },
        { id: 2, date: new Date(2006, 11, 10), title: "Science Fair", content: "Built a volcano. It actually worked!" },
        { id: 3, date: new Date(2008, 8, 1), title: "Middle School", content: "Harder classes, more freedom. Joined chess club." },
        { id: 4, date: new Date(2010, 3, 20), title: "Robotics", content: "Started building robots. Found my passion." },
        { id: 5, date: new Date(2011, 8, 1), title: "High School", content: "AP classes and late nights studying." },
        { id: 6, date: new Date(2013, 11, 5), title: "College Apps", content: "Submitted to 8 schools. Waiting is torture." },
        { id: 7, date: new Date(2014, 3, 15), title: "Accepted!", content: "Got into my dream school with scholarship." },
        { id: 8, date: new Date(2015, 5, 10), title: "Internship", content: "First real coding job. Learning so much." },
      ]
    },
    {
      id: 2,
      name: "Career",
      x: 700,
      collapsed: false,
      color: "#dc2626",
      entries: [
        { id: 9, date: new Date(2016, 6, 1), title: "First Job", content: "Software engineer at TechCorp. Nervous but excited." },
        { id: 10, date: new Date(2017, 2, 15), title: "First Deploy", content: "Pushed code to production. Users using my work!" },
        { id: 11, date: new Date(2018, 2, 1), title: "Promoted", content: "Senior engineer. Leading a small team now." },
        { id: 12, date: new Date(2019, 10, 20), title: "Major Launch", content: "Shipped our biggest feature. Press coverage." },
        { id: 13, date: new Date(2020, 0, 1), title: "Startup", content: "Joined a 20-person startup. Fast pace, big impact." },
        { id: 14, date: new Date(2023, 5, 1), title: "Founded Company", content: "Started my own thing. Terrifying but right." },
      ]
    },
    {
      id: 3,
      name: "Family",
      x: 1000,
      collapsed: false,
      color: "#059669",
      entries: [
        { id: 15, date: new Date(2003, 5, 15), title: "Sister Born", content: "Emma arrived. I'm a big brother now." },
        { id: 16, date: new Date(2010, 11, 20), title: "Big Move", content: "Family relocated. Saying goodbye was hard." },
        { id: 17, date: new Date(2013, 6, 4), title: "Lost Grandpa", content: "He shaped who I am. Miss him every day." },
        { id: 18, date: new Date(2017, 4, 10), title: "Met Sarah", content: "Coffee shop. Talked for hours. Something clicked." },
        { id: 19, date: new Date(2020, 2, 15), title: "Pandemic", content: "World changed. Working from home together." },
        { id: 20, date: new Date(2023, 0, 20), title: "First Steps", content: "Lily walked today. Growing so fast." },
      ]
    }
  ]
};

export default function LifeTimeline({ initialData = null }) {
  const [data, setData] = useState(initialData || sampleData);
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  const spineX = 120;
  const entrySpacing = 70;
  const startY = 100;

  // Calculate positions
  const allDates = [
    ...(data.mainTimeline || []).map(e => e.date),
    ...(data.branches || []).flatMap(b => (b.entries || []).map(e => e.date))
  ].sort((a, b) => a.getTime() - b.getTime());

  const dateToY = new Map();
  allDates.forEach((date, idx) => {
    dateToY.set(date.getTime(), startY + (idx * entrySpacing));
  });

  const totalHeight = startY + (allDates.length * entrySpacing) + 100;

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    
    setData(prev => ({
      ...prev,
      branches: prev.branches.map(b => 
        b.id === dragging ? { ...b, x: Math.max(300, Math.min(1300, newX)) } : b
      )
    }));
  };

  const toggleCollapse = (branchId) => {
    setData(prev => ({
      ...prev,
      branches: prev.branches.map(b => 
        b.id === branchId ? { ...b, collapsed: !b.collapsed } : b
      )
    }));
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#fafaf9',
      overflow: 'auto',
      fontFamily: 'Georgia, serif'
    }}>
      <div style={{
        height: '56px',
        borderBottom: '1px solid #e7e5e4',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#292524' }}>
          Life Timeline
        </h1>
      </div>

      <svg 
        ref={svgRef}
        width="100%" 
        height={totalHeight}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => setDragging(null)}
        style={{ cursor: dragging ? 'grabbing' : 'default', background: '#fafaf9' }}
      >
        {/* Main spine */}
        <line
          x1={spineX}
          y1={50}
          x2={spineX}
          y2={totalHeight - 50}
          stroke="#78716c"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Main timeline entries */}
        {(data.mainTimeline || []).map(entry => {
          const y = dateToY.get(entry.date.getTime());
          
          return (
            <g key={entry.id}>
              <circle cx={spineX} cy={y} r="5" fill="#57534e" />
              
              <foreignObject
                x={spineX - 280}
                y={y - 8}
                width="250"
                height="80"
              >
                <div style={{ textAlign: 'right', paddingRight: '15px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#292524',
                    marginBottom: '2px',
                    fontFamily: '-apple-system, sans-serif'
                  }}>
                    {entry.title}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#78716c',
                    marginBottom: '4px',
                    fontFamily: '-apple-system, sans-serif'
                  }}>
                    {entry.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#44403c',
                    lineHeight: '1.5'
                  }}>
                    {entry.content}
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* Branches */}
        {(data.branches || []).map(branch => {
          if (!branch.entries || branch.entries.length === 0) return null;
          
          const firstEntry = branch.entries[0];
          const lastEntry = branch.entries[branch.entries.length - 1];
          const branchStartY = dateToY.get(firstEntry.date.getTime());
          const branchEndY = dateToY.get(lastEntry.date.getTime());

          return (
            <g key={branch.id}>
              {/* Diagonal connection */}
              <line
                x1={spineX}
                y1={branchStartY}
                x2={branch.x}
                y2={branchStartY}
                stroke={branch.color}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
              />

              {/* Branch name */}
              <g
                onMouseDown={() => setDragging(branch.id)}
                style={{ cursor: 'grab' }}
              >
                <text
                  x={branch.x - 12}
                  y={branchStartY - 15}
                  fontSize="10"
                  fill={branch.color}
                  fontWeight="600"
                  fontFamily="-apple-system, sans-serif"
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(branch.id);
                  }}
                >
                  {branch.collapsed ? '▶' : '▼'}
                </text>
                <text
                  x={branch.x + 5}
                  y={branchStartY - 15}
                  fontSize="14"
                  fill={branch.color}
                  fontWeight="600"
                  fontFamily="-apple-system, sans-serif"
                  style={{ userSelect: 'none' }}
                >
                  {branch.name}
                </text>
              </g>

              {/* Vertical branch */}
              {!branch.collapsed && (
                <line
                  x1={branch.x}
                  y1={branchStartY}
                  x2={branch.x}
                  y2={branchEndY}
                  stroke={branch.color}
                  strokeWidth="2.5"
                  opacity="0.4"
                  strokeLinecap="round"
                />
              )}

              {/* Branch entries */}
              {!branch.collapsed && branch.entries.map(entry => {
                const entryY = dateToY.get(entry.date.getTime());

                return (
                  <g key={entry.id}>
                    <circle cx={branch.x} cy={entryY} r="3" fill={branch.color} />
                    <line
                      x1={branch.x}
                      y1={entryY}
                      x2={branch.x + 15}
                      y2={entryY}
                      stroke={branch.color}
                      strokeWidth="1.5"
                      opacity="0.5"
                    />

                    <foreignObject
                      x={branch.x + 20}
                      y={entryY - 8}
                      width="240"
                      height="70"
                    >
                      <div>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#292524',
                          marginBottom: '1px',
                          fontFamily: '-apple-system, sans-serif'
                        }}>
                          {entry.title}
                        </div>
                        <div style={{
                          fontSize: '9px',
                          color: '#78716c',
                          marginBottom: '3px',
                          fontFamily: '-apple-system, sans-serif'
                        }}>
                          {entry.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: '#44403c',
                          lineHeight: '1.5'
                        }}>
                          {entry.content}
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}