-- Force types regeneration by adding a helpful comment
COMMENT ON TABLE user_behaviors IS 'Tracks user behavior and interactions for lead scoring';
COMMENT ON FUNCTION update_lead_score(text, integer, text) IS 'Updates lead score based on user behavior';
