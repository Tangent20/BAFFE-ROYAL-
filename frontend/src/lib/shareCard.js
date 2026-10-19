// Generate a shareable PNG score card via Canvas API (no library needed)

export const generateShareCard = ({ pseudo, score, kos, comboMax, grade, isDaily }) => {
    const W = 1080;
    const H = 1350; // Instagram story friendly
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background cream
    ctx.fillStyle = '#FFF9E6';
    ctx.fillRect(0, 0, W, H);

    // Halftone dots
    ctx.fillStyle = 'rgba(10,10,10,0.12)';
    for (let y = 0; y < H; y += 26) {
        for (let x = 0; x < W; x += 26) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Top yellow banner
    ctx.save();
    ctx.translate(W / 2, 200);
    ctx.rotate(-0.04);
    ctx.fillStyle = '#FFFF00';
    ctx.strokeStyle = '#0A0A0A';
    ctx.lineWidth = 10;
    ctx.fillRect(-440, -80, 880, 160);
    ctx.strokeRect(-440, -80, 880, 160);
    // Shadow
    ctx.fillStyle = '#0A0A0A';
    ctx.font = 'bold 90px Bangers, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BAFFE ROYALE', 0, 5);
    ctx.restore();

    // Grade big box
    const gradeColors = { S: '#39FF14', A: '#FFFF00', B: '#00FFFF', C: '#FF8C00', D: '#FF0000' };
    const gradeText = { S: 'GIFLEUR LÉGENDAIRE', A: 'CHAMPION DU SLAP', B: 'BAFFEUR HONORABLE', C: 'MAIN MOLLE', D: 'PIOUPIOU' };
    ctx.save();
    ctx.translate(W / 2, 540);
    // Shadow
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(-340 + 18, -200 + 18, 680, 400);
    ctx.fillStyle = gradeColors[grade] || '#FFFF00';
    ctx.fillRect(-340, -200, 680, 400);
    ctx.strokeStyle = '#0A0A0A';
    ctx.lineWidth = 12;
    ctx.strokeRect(-340, -200, 680, 400);
    // Grade letter
    ctx.fillStyle = '#0A0A0A';
    ctx.font = 'bold 380px Bangers, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(grade, 0, 10);
    ctx.restore();

    // Verdict label
    ctx.fillStyle = '#0A0A0A';
    ctx.font = 'bold 56px Bangers, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(gradeText[grade] || 'BAFFEUR', W / 2, 790);

    // Pseudo
    ctx.fillStyle = '#FF3B30';
    ctx.font = 'bold 70px Bangers, Arial Black, sans-serif';
    ctx.fillText((pseudo || 'ANONYME').toUpperCase(), W / 2, 880);

    // Stats blocks
    const drawStat = (x, label, value, bg, valColor = '#0A0A0A') => {
        const w = 280, h = 200;
        // Shadow
        ctx.fillStyle = '#0A0A0A';
        ctx.fillRect(x + 10, 950 + 10, w, h);
        ctx.fillStyle = bg;
        ctx.fillRect(x, 950, w, h);
        ctx.strokeStyle = '#0A0A0A';
        ctx.lineWidth = 8;
        ctx.strokeRect(x, 950, w, h);
        ctx.fillStyle = valColor;
        ctx.font = 'bold 80px Bangers, Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(value), x + w / 2, 1040);
        ctx.fillStyle = '#0A0A0A';
        ctx.font = 'bold 24px "Space Mono", Courier, monospace';
        ctx.fillText(label, x + w / 2, 1110);
    };

    drawStat(80, 'SCORE', score, '#FFFF00');
    drawStat(400, 'KO', kos, '#00FFFF');
    drawStat(720, 'COMBO MAX', `x${comboMax}`, '#FF3B30', '#FFFFFF');

    // Daily badge
    if (isDaily) {
        ctx.save();
        ctx.translate(W / 2, 1240);
        ctx.rotate(-0.03);
        ctx.fillStyle = '#0A0A0A';
        ctx.fillRect(-260 + 8, -40 + 8, 520, 70);
        ctx.fillStyle = '#39FF14';
        ctx.fillRect(-260, -40, 520, 70);
        ctx.strokeStyle = '#0A0A0A';
        ctx.lineWidth = 6;
        ctx.strokeRect(-260, -40, 520, 70);
        ctx.fillStyle = '#0A0A0A';
        ctx.font = 'bold 44px Bangers, Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📅 DAILY CHALLENGE', 0, 5);
        ctx.restore();
    }

    // Footer
    ctx.fillStyle = '#0A0A0A';
    ctx.font = 'bold 26px "Space Mono", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('JOUE TOI AUSSI · BAFFE-ROYALE.COM', W / 2, H - 50);

    return canvas.toDataURL('image/png');
};

export const downloadShareCard = (dataUrl, filename = 'baffe-royale-score.png') => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
