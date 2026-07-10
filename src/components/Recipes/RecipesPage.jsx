import { useState } from 'react';
import { Sparkles, ChefHat, Clock, Users, Flame, AlertTriangle } from 'lucide-react';
import { getRecipeSuggestions } from '../../services/geminiAI';
import { loadSettings } from '../../services/storage';
import { CATEGORIES } from '../../data/categories';
import Header from '../Layout/Header';

export default function RecipesPage({ inventory }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [generated, setGenerated] = useState(false);

  const settings = loadSettings();
  const activeItems = inventory.filter(i => !i.isUsed && !i.isWasted);
  const urgentItems = activeItems.filter(i => i.status === 'urgent' || i.status === 'warning');

  const getCategoryEmoji = (cat) => CATEGORIES.find(c => c.id === cat)?.emoji || '🍽️';

  const handleGenerate = async () => {
    if (activeItems.length === 0) {
      setError('Add some items to your pantry first!');
      return;
    }
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const result = await getRecipeSuggestions(settings.geminiApiKey, activeItems, settings.healthProfile);
      setRecipes(Array.isArray(result) ? result : []);
      setGenerated(true);
      setExpandedRecipe(0);
    } catch (e) {
      setError('Failed to get recipes: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="page-enter">
      <Header title="AI Recipes" subtitle="Meals powered by what's in your kitchen" />

      <div className="page-content">
        {/* Urgent Ingredients Banner */}
        {urgentItems.length > 0 && (
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08))',
            borderColor: 'rgba(239, 68, 68, 0.2)', padding: 20, marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <AlertTriangle size={18} style={{ color: 'var(--urgent)' }} />
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-100)' }}>
                Urgent Ingredients to Use
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {urgentItems.map(item => (
                <span key={item.id} style={{
                  background: item.status === 'urgent' ? 'var(--urgent-bg)' : 'var(--warning-bg)',
                  border: `1px solid ${item.status === 'urgent' ? 'var(--urgent-border)' : 'var(--warning-border)'}`,
                  color: item.status === 'urgent' ? 'var(--urgent)' : 'var(--warning)',
                  borderRadius: 'var(--r-full)', padding: '6px 14px', fontSize: 13, fontWeight: 600,
                }}>
                  {getCategoryEmoji(item.category)} {item.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(34, 211, 238, 0.05))',
          borderColor: 'rgba(167, 139, 250, 0.2)', textAlign: 'center', padding: 32, marginBottom: 32
        }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'rgba(167, 139, 250, 0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <ChefHat size={32} color="var(--violet-400)" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text-100)', fontFamily: "'Space Grotesk', sans-serif" }}>
            {generated ? 'Discover New Meals' : 'AI Recipe Generation'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-400)', marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>
            Gemini AI analyzes your pantry to create practical, delicious Indian recipes prioritizing items that will expire soon.
          </p>

          {error && (
            <div style={{ background: 'var(--urgent-bg)', color: 'var(--urgent)', border: '1px solid var(--urgent-border)', padding: 12, borderRadius: 'var(--r-md)', marginBottom: 24, fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: '100%', height: 56, background: 'linear-gradient(135deg, var(--violet-400), #8b5cf6)' }}
          >
            {loading ? (
              <><div className="spinner" /> Analyzing {activeItems.length} pantry items...</>
            ) : (
              <><Sparkles size={20} style={{ marginRight: 8 }} /> {generated ? 'Regenerate Recipes' : 'Generate Recipes'}</>
            )}
          </button>
        </div>

        {/* Recipe Cards */}
        {recipes.length > 0 && (
          <div className="slide-up">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-100)' }}>
              <Sparkles size={18} color="var(--green-400)" /> {recipes.length} Generated Recipes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recipes.map((recipe, idx) => (
                <RecipeCard
                  key={idx}
                  recipe={recipe}
                  isExpanded={expandedRecipe === idx}
                  onToggle={() => setExpandedRecipe(expandedRecipe === idx ? null : idx)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeCard({ recipe, isExpanded, onToggle }) {
  const difficultyColor = {
    Easy: 'var(--fresh)',
    Medium: 'var(--warning)',
    Hard: 'var(--urgent)',
  }[recipe.difficulty] || 'var(--text-400)';

  return (
    <div className="glass-card" style={{ padding: 0 }}>
      {/* Header */}
      <div onClick={onToggle} style={{ padding: 20, cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--text-100)' }}>{recipe.name}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-400)', lineHeight: 1.5, marginBottom: 16 }}>{recipe.description}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-300)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 'var(--r-full)' }}>
                <Clock size={14} /> {recipe.cookTime}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-300)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 'var(--r-full)' }}>
                <Users size={14} /> {recipe.serves}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: difficultyColor, background: `color-mix(in srgb, ${difficultyColor} 10%, transparent)`, padding: '6px 12px', borderRadius: 'var(--r-full)' }}>
                <Flame size={14} /> {recipe.difficulty}
              </span>
            </div>
          </div>

          <div style={{
            width: 36, height: 36, background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>

        {recipe.urgentIngredients?.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-500)', marginRight: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Rescues:</span>
            {recipe.urgentIngredients.map((ing, i) => (
              <span key={i} style={{
                color: 'var(--green-400)', fontSize: 13, fontWeight: 700,
                marginRight: 8, display: 'inline-block'
              }}>
                ✓ {ing}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="slide-up" style={{ padding: '0 20px 20px', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ paddingTop: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-200)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 Ingredients List
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 24, background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 'var(--r-md)' }}>
              {recipe.allIngredients?.map((ing, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: ing.fromPantry ? 'var(--green-400)' : 'var(--text-500)' }} />
                  <span style={{ color: ing.fromPantry ? 'var(--text-100)' : 'var(--text-400)', fontWeight: ing.fromPantry ? 600 : 400 }}>{ing.name}</span>
                  <div style={{ flex: 1, borderBottom: '1px dashed rgba(255,255,255,0.1)' }} />
                  <span style={{ color: 'var(--text-300)', fontWeight: 600 }}>{ing.quantity}</span>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-200)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              👨‍🍳 Cooking Instructions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recipe.steps?.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: 12, fontWeight: 700, color: 'var(--text-300)', border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ color: 'var(--text-300)', lineHeight: 1.6, fontSize: 14, paddingTop: 3 }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
