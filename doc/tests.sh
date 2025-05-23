# list all texts
curl -X GET http://localhost:3000/api/texts

# get an id
curl -X GET http://localhost:3000/api/texts/1

# new text
curl -X POST http://localhost:3000/api/texts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新しい物語",
    "content": "これは新しい物語の本文です。"
  }'

# update text
curl -X PUT http://localhost:3000/api/texts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新された物語",
    "content": "これは更新された物語の本文です。"
  }'

# update text (bookmarks)
curl -X PUT http://localhost:3000/api/texts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "last_read_position": 250,
    "last_read_timestamp": "2023-10-26T14:45:00Z"
  }'

# delete
curl -X DELETE http://localhost:3000/api/texts/1
