# Predictive Analytics System Guide

## Overview

The Predictive Analytics system uses machine learning to forecast alert volume and identify campaigns likely to trigger alerts before thresholds are breached. It analyzes historical performance data to provide proactive recommendations.

## Features

### 🧠 ML-Powered Predictions
- Uses Lovable AI (Google Gemini 2.5 Flash) for intelligent forecasting
- Analyzes patterns across email, SMS, WhatsApp, and overall performance
- Predicts alert probability, conversion rates, and ROI

### 📊 Multi-Period Forecasts
- **Next 24 Hours**: Immediate risk assessment
- **Next 7 Days**: Short-term planning
- **Next 30 Days**: Long-term strategic insights

### 🎯 Risk Assessment
- **High Risk** (≥70%): Immediate action required
- **Medium Risk** (40-69%): Monitor closely
- **Low Risk** (<40%): Normal operations

### 💡 Actionable Insights
- Contributing factors analysis
- Specific recommendations to prevent alerts
- Confidence scores for each prediction

## How It Works

### 1. Data Collection
The system analyzes:
- Last 30 days of campaign performance
- Email, SMS, and WhatsApp metrics
- Historical alert patterns
- Day-of-week effects and trends

### 2. ML Analysis
Uses advanced ML to:
- Identify patterns leading to alerts
- Calculate alert probabilities
- Forecast performance metrics
- Generate actionable recommendations

### 3. Prediction Storage
Results are stored in `alert_predictions` table with:
- Prediction date and period
- Channel-specific forecasts
- Contributing factors
- Recommended actions
- Confidence scores

## Accessing Predictions

### Via Admin Dashboard
1. Navigate to `/admin/predictive-analytics`
2. Requires admin role
3. View predictions by time period

### Generate New Predictions
```typescript
const { data, error } = await supabase.functions.invoke("predict-alerts");
```

### Manual Trigger
Click "Generate Predictions" button in the dashboard to run ML analysis on current data.

## Automated Predictions

### Setup Cron Job
Run predictions daily at 6 AM:

```sql
SELECT cron.schedule(
  'generate-predictions-daily',
  '0 6 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/predict-alerts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Multiple Times Per Day
For more frequent predictions:
```sql
-- Every 6 hours
SELECT cron.schedule(
  'generate-predictions-6h',
  '0 */6 * * *',
  $$ [same as above] $$
);
```

## Understanding Predictions

### Alert Probability
- Likelihood of triggering an alert
- Based on historical patterns and current trends
- Higher scores indicate greater risk

### Predicted Conversion Rate
- Forecasted percentage of conversions
- Compared against threshold settings
- Green = above target, Red = below target

### Predicted ROI
- Estimated return on investment
- Negative ROI triggers alerts
- Consider costs vs. revenue

### Confidence Score
- How certain the ML model is (0-100%)
- Higher confidence = more reliable prediction
- Based on data quality and pattern strength

## Contributing Factors

Common factors identified:
- **Declining Engagement**: Lower open/click rates
- **Weekend Effect**: Performance drops on weekends
- **Seasonality**: Time-based patterns
- **Increased Costs**: Higher SMS/WhatsApp costs
- **Market Trends**: External factors

## Recommendations

Typical recommendations:
- **Increase Discounts**: Boost incentives
- **Optimize Send Times**: Use optimal send time data
- **A/B Test Content**: Try new messaging
- **Reduce Frequency**: Avoid saturation
- **Improve Targeting**: Refine segments
- **Budget Reallocation**: Shift to better-performing channels

## Dashboard Features

### Risk Overview Cards
- Quick view of each channel's risk level
- Key metrics at a glance
- Color-coded risk indicators

### Predictive Charts
- Alert probability by channel
- Conversion rate trends
- ROI forecasts

### Insights & Actions
- Detailed factor analysis
- Prioritized recommendations
- Channel-specific guidance

## Best Practices

### 1. Regular Monitoring
- Check predictions daily
- Act on high-risk alerts immediately
- Track prediction accuracy over time

### 2. Proactive Action
- Implement recommendations before alerts trigger
- Test changes on small segments first
- Document what works

### 3. Data Quality
- Ensure accurate tracking
- Maintain at least 30 days of history
- Clean up anomalies

### 4. Continuous Improvement
- Compare predictions vs. actual results
- Adjust thresholds based on insights
- Share learnings across team

## Troubleshooting

### No Predictions Generated
**Cause**: Insufficient historical data
**Solution**: Need at least 7-14 days of campaign data

### Low Confidence Scores
**Cause**: Irregular patterns or limited data
**Solution**: Maintain consistent campaign schedule

### Inaccurate Predictions
**Cause**: Rapidly changing conditions
**Solution**: Generate predictions more frequently

### Function Timeout
**Cause**: Too much data to process
**Solution**: Reduce historical data window or optimize queries

## SQL Queries

### View Latest Predictions
```sql
SELECT *
FROM alert_predictions
WHERE prediction_period = 'next_24h'
ORDER BY prediction_date DESC
LIMIT 10;
```

### High Risk Channels
```sql
SELECT channel, predicted_alert_probability, recommendations
FROM alert_predictions
WHERE predicted_alert_probability >= 70
AND prediction_period = 'next_24h'
ORDER BY predicted_alert_probability DESC;
```

### Prediction Accuracy
```sql
SELECT 
  channel,
  AVG(prediction_accuracy) as avg_accuracy,
  COUNT(*) as prediction_count
FROM alert_predictions
WHERE actual_alert_triggered IS NOT NULL
GROUP BY channel;
```

## API Response Format

```json
{
  "success": true,
  "predictions_generated": 12,
  "predictions": [
    {
      "channel": "email",
      "period": "next_24h",
      "alert_probability": 45.5,
      "predicted_conversion_rate": 4.2,
      "predicted_roi": -15.3,
      "confidence": 78.5,
      "factors": ["Declining engagement trend", "Weekend effect"],
      "recommendations": ["Increase discount", "Optimize send times"]
    }
  ]
}
```

## Integration with Alerts

Predictions complement the alert system:
1. **Proactive**: Act before thresholds breach
2. **Reactive**: Alerts notify when thresholds are breached
3. **Combined**: Use both for comprehensive monitoring

## Performance Impact

- Prediction generation takes 10-30 seconds
- Uses Lovable AI credits (minimal cost)
- Database queries optimized for speed
- No impact on live campaigns

## Future Enhancements

- Real-time prediction updates
- Automated action implementation
- Prediction accuracy tracking
- Custom ML model training
- Integration with external data sources

## Support

For issues or questions:
1. Check function logs in Lovable Cloud
2. Verify historical data exists
3. Ensure Lovable AI is enabled
4. Contact support with prediction IDs