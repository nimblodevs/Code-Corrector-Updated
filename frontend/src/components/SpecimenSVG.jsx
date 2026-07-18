function SpecimenSVG({ type, colour }) {
  const c = colour || '#7c3aed';
  if (type === 'urine') return (
    <svg width={48} height={56} viewBox='0 0 48 56'>
      <rect x={12} y={6} width={24} height={42} rx={5} fill='#fef9c3' stroke={c} strokeWidth={2}/>
      <rect x={12} y={6} width={24} height={10} rx={5} fill={c}/>
      <rect x={18} y={2} width={12} height={7} rx={3} fill={c}/>
      <ellipse cx={24} cy={36} rx={8} ry={10} fill={c} opacity={.18}/>
    </svg>
  );
  if (type === 'stool') return (
    <svg width={48} height={56} viewBox='0 0 48 56'>
      <rect x={8} y={10} width={32} height={36} rx={6} fill='#fef3c7' stroke={c} strokeWidth={2}/>
      <rect x={8} y={10} width={32} height={10} rx={6} fill={c}/>
      <path d='M16 26 Q24 22 32 26 Q24 30 16 26Z' fill={c} opacity={.25}/>
    </svg>
  );
  if (type === 'swab') return (
    <svg width={48} height={56} viewBox='0 0 48 56'>
      <rect x={21} y={4} width={6} height={44} rx={3} fill={c} opacity={.3}/>
      <ellipse cx={24} cy={8} rx={7} ry={7} fill={c}/>
      <ellipse cx={24} cy={48} rx={7} ry={7} fill={c} opacity={.5}/>
    </svg>
  );
  if (type === 'finger-prick/venous') return (
    <svg width={48} height={56} viewBox='0 0 48 56'>
      <rect x={14} y={4} width={20} height={46} rx={10} fill='#fee2e2' stroke={c} strokeWidth={2}/>
      <rect x={14} y={4} width={20} height={12} rx={10} fill={c}/>
      <ellipse cx={24} cy={38} rx={7} ry={9} fill={c} opacity={.25}/>
      <path d='M20 2 L24 0 L28 2' stroke={c} strokeWidth={2} fill='none'/>
    </svg>
  );
  // Default: venous blood tube
  return (
    <svg width={48} height={56} viewBox='0 0 48 56'>
      <rect x={14} y={4} width={20} height={46} rx={10} fill='#fee2e2' stroke={c} strokeWidth={2}/>
      <rect x={14} y={4} width={20} height={12} rx={10} fill={c}/>
      <ellipse cx={24} cy={38} rx={7} ry={9} fill={c} opacity={.25}/>
    </svg>
  );
}


export default SpecimenSVG;
