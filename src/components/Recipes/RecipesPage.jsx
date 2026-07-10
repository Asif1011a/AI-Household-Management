import { useState, useEffect } from 'react';
import { Sparkles, ChefHat, Clock, Users, Flame, RefreshCw, AlertTriangle } from 'lucide-react';
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
    <div className="fade-in">
      <Header title="AI Recipes" subtitle="Meals powered by what's in your kitchen" />

      <div className="page-content">
        {/* Urgent Ingredients Banner */}
        {urgentItems.length > 0 && (
          <div className="card mb-24" style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(245, 158, 11, 0.06))',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={18} style={{ color: 'var(--status-urgent)' }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                Use these ingredients today to avoid waste:
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {urgentItems.map(item => (
                <span key={item.id} style={{
                  background: item.status === 'urgent' ? 'var(--status-urgent-bg)' : 'var(--status-warning-bg)',
                  border: `1px solid ${item.status === 'urgent' ? 'var(--status-urgent-border)' : 'var(--status-warning-border)'}`,
                  color: item.status === 'urgent' ? 'var(--status-urgent)' : 'var(--status-warning)',
                  borderRadius: 'var(--radius-full)',
                  padding: '5px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                }}>
                  {getCategoryEmoji(item.category)} {item.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="card mb-24" style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(99,102,241,0.06))',
          border: '1px solid rgba(34,197,94,0.15)',
          textAlign: 'center', padding: '32px',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🍳</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            {generated ? 'Regenerate Recipes' : 'Get AI Recipe Suggestions'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Gemini AI analyzes your pantry and suggests practical Indian recipes that prioritize your near-expiry ingredients
          </p>

          {error && (
            <div className="alert-banner alert-urgent" style={{ textAlign: 'left', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerate}
            disabled={loading}
            style={{ minWidth: 240 }}
          >
            {loading ? (
              <>
                <div className="loading-dots">
                  <span /><span /><span />
                </div>
                Thinking with Gemini...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                {generated ? 'Generate New Recipes' : 'Generate Recipes Now'}
              </>
            )}
          </button>

          {loading && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
              🤖 AI is analyzing your {activeItems.length} pantry items...
            </p>
          )}
        </div>

        {/* Recipe Cards */}
        {recipes.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              🍽️ {recipes.length} Recipes Suggested for You
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
    Easy: 'var(--status-fresh)',
    Medium: 'var(--status-warning)',
    Hard: 'var(--status-urgent)',
  }[recipe.difficulty] || 'var(--text-secondary)';

  return (
    <div className="recipe-card">
      <div className="recipe-card-header" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{recipe.name}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{recipe.description}</p>

            <div className="recipe-meta">
              <div className="recipe-meta-item">
                <Clock size={14} /> {recipe.cookTime}
              </div>
              <div className="recipe-meta-item">
                <Users size={14} /> Serves {recipe.serves}
              </div>
              <div className="recipe-meta-item" style={{ color: difficultyColor }}>
                <Flame size={14} /> {recipe.difficulty}
              </div>
              {recipe.wastesSaved > 0 && (
                <div className="recipe-meta-item" style={{ color: 'var(--green-400)', fontWeight: 600 }}>
                  🌿 Saves {recipe.wastesSaved} item{recipe.wastesSaved !== 1 ? 's' : ''} from waste
                </div>
              )}
            </div>
          </div>

          <div style={{
            width: 36, height: 36, background: 'rgba(255,255,255,0.05)',
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginLeft: 16, flexShrink: 0, transition: 'transform 0.2s',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
          }}>
            ▼
          </div>
        </div>

        {/* Urgent ingredients used */}
        {recipe.urgentIngredients?.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 8 }}>Uses urgently:</span>
            {recipe.urgentIngredients.map((ing, i) => (
              <span key={i} style={{
                background: 'var(--status-urgent-bg)', color: 'var(--status-urgent)',
                border: '1px solid var(--status-urgent-border)',
                borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: 12, fontWeight: 600,
                marginRight: 6,
              }}>
                🔴 {ing}
              </span>
            ))}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="recipe-card-body slide-up">
          {/* Ingredients */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>📋 Ingredients</div>
            <div className="recipe-ingredients">
              {recipe.allIngredients?.map((ing, i) => (
                <span key={i} className={`recipe-ingredient-tag ${ing.fromPantry ? 'urgent' : ''}`}>
                  {ing.fromPantry ? '✓ ' : ''}{ing.quantity} {ing.name}
                </span>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>👨‍🍳 How to Cook</div>
            <ol className="recipe-steps">
              {recipe.steps?.map((step, i) => (
                <li key={i} className="recipe-step">
                  <span className="recipe-step-num">{i + 1}</span>
                  <span style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
