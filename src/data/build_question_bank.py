#!/usr/bin/env python3
"""
build_question_bank.py - Enhanced classification & Challenger distractor generator
"""

import re
import json
import random

INPUT_FILE = '/tmp/extracted_mcqs.txt'
OUTPUT_FILE = '/home/master/Work/diploma-mcq-platform/src/data/questions.json'

def extract_memory_tip(question, explanation, answer, options):
    q_lower = question.lower()
    exp_lower = explanation.lower()
    correct_text = options.get(answer, "")
    
    # 1. Chemistry Redox
    if "oil rig" in exp_lower or "oxidation" in q_lower or "reduction" in q_lower:
        if "oxidation" in q_lower and ("loss" in exp_lower or "loses" in exp_lower):
            return "💡 Remember: OIL = Oxidation Is Loss of electrons (Oxidation state increases)."
        if "reduction" in q_lower and ("gain" in exp_lower or "gains" in exp_lower):
            return "💡 Remember: RIG = Reduction Is Gain of electrons (Oxidation state decreases)."
        return "💡 Shortcut: 'OIL RIG' — Oxidation Is Loss, Reduction Is Gain of electrons."
    
    # 2. Dimensions
    if "dimension" in q_lower or "[" in correct_text or "^" in correct_text:
        if "force" in q_lower:
            return "💡 Memory Rule: Force = Mass × Acc = [M] × [L T⁻²] = [M L T⁻²]."
        if "energy" in q_lower or "work" in q_lower or "torque" in q_lower:
            return "💡 Memory Rule: Work = Force × Dist = [M L T⁻²] × [L] = [M L² T⁻²]."
        if "power" in q_lower:
            return "💡 Memory Rule: Power = Work / Time = [M L² T⁻²] / [T] = [M L² T⁻³]."
        if "momentum" in q_lower or "impulse" in q_lower:
            return "💡 Memory Rule: Momentum & Impulse share [M L T⁻¹] (p = mv, J = F·t)."
        if "pressure" in q_lower or "stress" in q_lower:
            return "💡 Memory Rule: Pressure = Force / Area = [M L T⁻²] / [L²] = [M L⁻¹ T⁻²]."
        if "frequency" in q_lower or "time period" in q_lower:
            return "💡 Memory Rule: Frequency = 1/Time = [T⁻¹] (dimensions: [M⁰ L⁰ T⁻¹])."
        if "dimensionless" in q_lower or "ratio" in exp_lower:
            return "💡 Rule: Ratios of identical quantities (Relative Density, Strain, Refractive Index) are Dimensionless [M⁰ L⁰ T⁰]."
        return "💡 Dimensional check: Write base equation first, then express in [M], [L], and [T]."
    
    # 3. Units & Prefixes
    if any(k in q_lower for k in ["prefix", "mega", "micro", "nano", "pico", "giga"]):
        return "💡 Metric Scale: Mega = 10⁶, Giga = 10⁹ | micro (μ) = 10⁻⁶, nano (n) = 10⁻⁹, pico (p) = 10⁻¹²."
    
    # 4. Electricity & Circuits
    if "ohm" in q_lower or "v = i" in exp_lower or "v = ir" in exp_lower:
        return "💡 The Ohm's Triangle: V = I × R (Voltage = Current × Resistance; R = V/I)."
    if "joule's law" in q_lower or ("heat" in q_lower and ("i^2" in exp_lower or "i²" in exp_lower)):
        return "💡 Joule's Law: Heat H = I²·R·t. Doubling current quadruples (×4) the heat produced!"
    if "series" in q_lower and "resistor" in q_lower:
        return "💡 Series Rule: Same current flows through all. Equivalent R_eq = R₁ + R₂ + R₃ (always greater than largest)."
    if "parallel" in q_lower and "resistor" in q_lower:
        return "💡 Parallel Rule: Same voltage across all. 1/R_eq = 1/R₁ + 1/R₂ (R_eq is always smaller than smallest branch)."
    if "galvanometer" in q_lower or "ammeter" in q_lower or "voltmeter" in q_lower:
        if "ammeter" in q_lower or "shunt" in q_lower:
            return "💡 Ammeter Hack: Moving coil galvanometer + LOW shunt resistor in PARALLEL."
        if "voltmeter" in q_lower or "multiplier" in q_lower:
            return "💡 Voltmeter Hack: Moving coil galvanometer + HIGH multiplier resistor in SERIES."
    
    # 5. Vectors
    if "dot product" in q_lower or "scalar product" in q_lower:
        return "💡 Dot Product: A · B = |A||B| cos θ. When perpendicular (90°), cos 90° = 0 → A · B = 0!"
    if "cross product" in q_lower or "vector product" in q_lower:
        return "💡 Cross Product: A × B = |A||B| sin θ n̂. Non-commutative: A × B = -(B × A). Direction via Right-Hand Rule."
    if "unit vector" in q_lower:
        return "💡 Unit Vector: Â = A / |A|. Has magnitude exactly 1, but has NO physical unit and NO dimension."
    
    # 6. Waves & Sound
    if "wave" in q_lower or "sound" in q_lower or "v = f" in exp_lower:
        if "frequency" in q_lower and "pitch" in q_lower:
            return "💡 Pitch vs Loudness: Frequency determines PITCH (treble/bass); Amplitude determines LOUDNESS."
        if "vacuum" in q_lower or "medium" in q_lower:
            return "💡 Propagation Rule: Sound is a mechanical wave requiring a material medium; it cannot travel in a vacuum."
        return "💡 Wave Relationship: Velocity = Frequency × Wavelength (v = f · λ)."
    
    # 7. Optics & TIR
    if "total internal reflection" in q_lower or "tir" in exp_lower or "critical angle" in q_lower:
        return "💡 2 TIR Rules: 1) Light must travel from Denser to Rarer medium; 2) Angle of incidence i > Critical angle c."
    if "snell" in q_lower or "refract" in q_lower:
        return "💡 Snell's Law: sin i / sin r = constant (n). When light enters a denser medium, it slows down & bends towards normal."
    if "polariz" in q_lower:
        return "💡 Polarization: Confines electric field vibrations strictly to one plane. Proves light is a transverse wave!"
    
    # 8. Modern Physics / Photoelectric
    if "photoelectric" in q_lower or "photon" in q_lower or "work function" in q_lower:
        if "kinetic energy" in q_lower or "stopping potential" in q_lower:
            return "💡 Frequency vs Intensity: Maximum KE and stopping potential depend ONLY on frequency, never on light intensity."
        if "current" in q_lower or "rate" in q_lower:
            return "💡 Photoelectric Current: Number of emitted photoelectrons per second is directly proportional to INTENSITY."
        return "💡 Einstein's Photoelectric Equation: Incident Photon Energy (hν) = Work Function (W₀) + Maximum KE (½mv²)."
    
    # 9. Thermometry & Heat
    if any(k in q_lower for k in ["conduction", "convection", "radiation"]):
        return "💡 Heat Modes: Conduction = Solid particle vibration | Convection = Fluid bulk movement | Radiation = EM waves through vacuum."
    if any(k in q_lower for k in ["kelvin", "celsius", "fahrenheit"]):
        return "💡 Temperature Conversions: K = °C + 273.15 | °F = (9/5)°C + 32. Water freezes at 0°C (32°F, 273.15K)."
    if any(k in q_lower for k in ["boyle", "charles", "gay-lussac"]):
        return "💡 Gas Laws: Boyle (T const → P ∝ 1/V) | Charles (P const → V ∝ T) | Gay-Lussac (V const → P ∝ T)."
    
    # 10. General extraction from explanation
    if explanation:
        first_clause = explanation.split(';')[0].split('.')[0].strip()
        return f"💡 Core Principle: {first_clause}."
    return f"💡 Quick Recall: {correct_text}."

def determine_difficulty(q_text, explanation, options):
    text = (q_text + " " + explanation).lower()
    
    # 1. Hard: Any numerical calculations, formulas with exponents/fractions, conversions
    has_math = any(c in q_text for c in ["=", "×", "·", "√", "^", "calculate", "convert", "magnitude of", "expanded formula", "what will be", "evaluate"])
    has_numbers = bool(re.search(r'\d+\s*(m/s|cm|mm|n|c|j|w|hz|v|k|ohms?|dyne|erg|kg)', text))
    has_complex_dim = bool(re.search(r'\[m\^?\d*\s*l\^?\d*\s*t\^?\d*\]', text))
    
    if has_math or has_numbers or has_complex_dim or "cross product" in text or "stopping potential" in text or "fourier" in text or "young's modulus" in text:
        return "hard"
        
    # 2. Easy: Short simple definitions, standard SI units, historical names, simple yes/no
    is_short = len(q_text.split()) <= 15
    easy_keywords = ["what is the si unit", "symbol used", "is called", "is known as", "termed as", "example of a physical", "what does the word", "invented by", "which instrument is", "human audibility"]
    if any(k in text for k in easy_keywords) and is_short:
        return "easy"
        
    return "normal"

def generate_challenger_distractors(q_text, options, answer_key):
    new_options = dict(options)
    q_lower = q_text.lower()
    
    trap_bank = {
        "physical": ["Relative Permittivity", "Magnetic Permeability", "Refractive Index", "Coefficient of Friction", "Specific Gravity"],
        "vector": ["Electric Current", "Pressure", "Surface Tension", "Temperature Gradient", "Electric Flux"],
        "scalar": ["Magnetic Field", "Angular Momentum", "Gravitational Field", "Torque", "Linear Momentum"],
        "fundamental": ["Newton", "Joule", "Pascal", "Volt", "Tesla", "Weber"],
        "derived": ["Kilogram", "Candela", "Ampere", "Kelvin", "Mole"],
        "electrolyte": ["Pure Water", "Aqueous Urea", "Glycerol", "Liquid Benzene", "Carbon Tetrachloride"],
        "instrument": ["Potentiometer", "Wheatstone Bridge", "Electrometer", "Ballistic Galvanometer"]
    }
    
    trivial_words = ["happiness", "sadness", "fever", "wooden", "plastic", "piece of chalk", "pencil", "explosion", "battery charger", "toy", "doorbell", "guitar string manually", "arbitrary unit", "decade box"]
    
    for opt, val in options.items():
        if opt == answer_key:
            continue
        val_lower = val.lower()
        if any(w in val_lower for w in trivial_words):
            if "physical quantity" in q_lower:
                new_options[opt] = random.choice(trap_bank["physical"])
            elif "vector" in q_lower:
                new_options[opt] = random.choice(trap_bank["vector"])
            elif "scalar" in q_lower:
                new_options[opt] = random.choice(trap_bank["scalar"])
            elif "electrolyte" in q_lower:
                new_options[opt] = random.choice(trap_bank["electrolyte"])
            elif "unit" in q_lower:
                new_options[opt] = random.choice(trap_bank["fundamental"])
            else:
                new_options[opt] = "Non-linear constant"

    return new_options

def parse_all():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    current_unit = "Unit 1: Units, Measurements & Vectors"
    raw_items = []
    current_q = None

    for line in lines:
        line_s = line.strip()
        if line_s.startswith("Unit ") and ":" in line_s:
            current_unit = line_s
            continue
        
        m_q = re.match(r'^Q(\d+)\.\s*(.*)', line_s)
        if m_q:
            if current_q:
                raw_items.append(current_q)
            current_q = {
                'unit': current_unit,
                'q_num': int(m_q.group(1)),
                'question': m_q.group(2).strip(),
                'options': {},
                'answer': '',
                'explanation': ''
            }
            continue
        
        if not current_q:
            continue
            
        m_opt = re.match(r'^([A-D])\)\s*(.*)', line_s)
        if m_opt:
            current_q['options'][m_opt.group(1)] = m_opt.group(2).strip()
            continue
            
        m_ans = re.match(r'^Answer:\s*([A-D])\)\s*([^—–-]+)[—–-]\s*(.*)', line_s)
        if m_ans:
            current_q['answer'] = m_ans.group(1)
            current_q['explanation'] = m_ans.group(3).strip()
            continue
        elif line_s.startswith('Answer:'):
            m_ans2 = re.match(r'^Answer:\s*([A-D])\)?\s*(.*)', line_s)
            if m_ans2:
                current_q['answer'] = m_ans2.group(1)
                current_q['explanation'] = m_ans2.group(2).strip()
            continue
            
        if current_q['explanation']:
            current_q['explanation'] += ' ' + line_s
        elif current_q['options']:
            last_opt = list(current_q['options'].keys())[-1]
            current_q['options'][last_opt] += ' ' + line_s
        else:
            current_q['question'] += ' ' + line_s

    if current_q:
        raw_items.append(current_q)

    unit_number_map = {
        "Unit 1: Units, Measurements & Vectors": 1,
        "Unit 2: Electricity & Magnetism": 2,
        "Unit 3: Waves & Oscillations": 3,
        "Unit 4: Optics": 4,
        "Unit 5: Thermometry": 5,
        "Unit 6: Electrochemistry, Redox Reactions & Metals": 6
    }
    
    enriched = []
    for idx, item in enumerate(raw_items):
        u_num = unit_number_map.get(item['unit'], 1)
        qid = f"u{u_num}_q{item['q_num']}_{idx+1}"
        
        diff = determine_difficulty(item['question'], item['explanation'], item['options'])
        tip = extract_memory_tip(item['question'], item['explanation'], item['answer'], item['options'])
        challenger_opts = generate_challenger_distractors(item['question'], item['options'], item['answer'])
        category = "Chemistry" if u_num == 6 else "Physics"
        
        q_text = item['question']
        if "[Question text missing" in q_text:
            q_text = "Physical quantities that possess magnitude only and no specific direction in space are known as:"
            
        q_obj = {
            "id": qid,
            "unit": u_num,
            "unitName": item['unit'],
            "category": category,
            "qNum": item['q_num'],
            "question": q_text,
            "options": item['options'],
            "challengerOptions": challenger_opts,
            "answer": item['answer'],
            "correctText": item['options'].get(item['answer'], ""),
            "explanation": item['explanation'],
            "difficulty": diff,
            "memoryTip": tip
        }
        enriched.append(q_obj)

    diff_counts = {d: sum(1 for q in enriched if q['difficulty'] == d) for d in ['easy', 'normal', 'hard']}
    print(f"Difficulty breakdown: {diff_counts}")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(enriched, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully processed {len(enriched)} questions.")

if __name__ == '__main__':
    parse_all()
