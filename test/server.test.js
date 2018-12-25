const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });
});

describe('Express static', function () {
  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe('404 handler', function () {
  it('should respond with 404 when given a bad path', function () {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(function (res) {
        expect(res).to.have.status(404);
      });
  });
});

describe('Notes List', function () {
  it('should list notes on GET', function () {
    return chai.request(app)
      .get('/api/notes')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.at.least(1);

        const expectedKeys = ['id', 'title', 'content'];
        res.body.forEach(item => {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  it('should searh for individual note by id on GET', function () {
    return (chai.request(app)
      .get('/api/notes/')
      .then(function (res) {
        const id = res.body[0].id;
        return chai.request(app)
          .get(`/api/notes/${id}`)
          .then(function (res){
            expect(res.body.id).to.eq(id);
            expect(res.body).to.be.a('object');
            return chai.request(app)
              .get('/api/notes/DOESNOTEXIST')
              .then(function (res) {
                expect(res).to.have.status(404);
              });
          });
      })
    );
  });

  it('should add a note on post', function () {
    const newNote = {title: 'some title', content: 'this is some content'};
    return chai.request(app)
      .post('/api/notes')
      .send(newNote)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
        expect(res.body.id).to.not.eq(null);
        expect(res.body).to.deep.eq(Object.assign(newNote, {id: res.body.id}));
      });
  });
  
  it('should return an obj with a msg prop "Missing title in request body" when missing "title" field in POST',
    function () {
      const badNote = {content: 'content from bad note'};
      return chai.request(app)
        .post('/api/notes')
        .send(badNote)
        .then(function (res) {
          expect(res.body.error).to.have.status(400);
          expect(res.body.message).to.eq('Missing `title` in request body');
        });
    }
  );
});

describe('PUT /api/notes/:id', function () {

  it('should update the note', function () {
    const updateItem = {
      'title': 'What about dogs?!',
      'content': 'woof woof'
    };
    return chai.request(app)
      .put('/api/notes/1005')
      .send(updateItem)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');

        expect(res.body.id).to.equal(1005);
        expect(res.body.title).to.equal(updateItem.title);
        expect(res.body.content).to.equal(updateItem.content);
      });
  });

  it('should respond with a 404 for an invalid id', function () {
    const updateItem = {
      'title': 'What about dogs?!',
      'content': 'woof woof'
    };
    return chai.request(app)
      .put('/api/notes/DOESNOTEXIST')
      .send(updateItem)
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(404);
      });
  });

  it('should return an error when missing "title" field', function () {
    const updateItem = {
      'foo': 'bar'
    };
    return chai.request(app)
      .put('/api/notes/1005')
      .send(updateItem)
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });
});

describe('DELETE  /api/notes/:id', function () {

  it('should delete an item by id', function () {
    return chai.request(app)
      .delete('/api/notes/1005')
      .then(function (res) {
        expect(res).to.have.status(204);
      });
  });

});



