from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from house_price_pred import predict_house_price

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['GET'])
def predict():
    city = request.args.get('city')
    state = request.args.get('state')

    if city and state:
        result = predict_house_price(city, state)
        response = make_response(jsonify(result))
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        return response
    else:
        return jsonify({"error": "Missing city or state parameter"}), 400

if __name__ == '__main__':
    app.run(debug=True)
