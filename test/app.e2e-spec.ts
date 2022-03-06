import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import * as pactum from 'pactum'
import { UserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';
describe('App e2e', () => {

  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }));
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333')
  });

  afterAll(() => { app.close() });

  describe('Auth', () => {

    const dto: AuthDto = {
      email: 'hermitcrab3000@gmail.com',
      password: 'hermitcrab'
    };

    describe('Test', () => {
      it('should test', () => {
        return pactum
          .spec()
          .get('/auth/test')
          .expectStatus(200);
      })
    })

    describe('Signup', () => {
      it('should throw if email empty', () => {

        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)

      })
      it('should throw if password empty', () => {

        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.email
          })
          .expectStatus(400)

      })

      it('should throw if @body empty', () => {

        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)

      })

      it('should signup', () => {

        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)

      })
    });

    describe('Signin', () => {

      it('should throw if email empty', () => {

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password
          })
          .expectStatus(400)

      })
      it('should throw if password empty', () => {

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.email
          })
          .expectStatus(400)

      })

      it('should throw if @body empty', () => {

        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400)

      })

      it('should signin', () => {

        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      })
    });
  });

  describe('User', () => {
    describe('Get current user', () => {
      it('Get me', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })
    })
  });

  describe('Edit user', () => {
    it('Should edit user', () => {
      const dto: UserDto = {
        firstName: 'hermitcrab2',
        email: 'newEditUser1@gmail.com'
      }
      return pactum
        .spec()
        .patch('/users')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
        .inspect()
    })
  })
});


describe('Bookmarks', () => {

  describe('Get empty bookmarks', () => {
    it('should get bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectBody([]);
    });
  });

  describe('Create bookmark', () => {

    const dto: CreateBookmarkDto = {
      title: 'YoT Bookmark',
      link: 'https://www.youtube.com/watch?v=Hwiyue-w2O4'
    }

    it('should create bookmark', () => {
      return pactum
        .spec()
        .post('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(201)
    })
  });

  describe('Get bookmarks', () => {
    it('Should get bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectJsonLength(1)
        .stores('bookmarkId', 'id')
    })
  });

  describe('Get bookmark by id', () => {
    it('Should get bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
    })
  });

  describe('Edit bookmark', () => {
    const dto: EditBookmarkDto = {
      title:
        'Nest is built around a language feature called decorators',
      description:
        ' Decorators are a well-known concept in a lot of commonly used programming languages, but in the JavaScript world, they are still relatively new',
    };
    it('should edit bookmark', () => {
      return pactum
        .spec()
        .patch('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.title)
        .expectBodyContains(dto.description);
    });
  });

  describe('Delete bookmark by id', () => {
    it('should delete bookmark', () => {
      return pactum
        .spec()
        .delete('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(204);
    });

    it('should get empty bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectJsonLength(0);
    });
  });
});




it.todo('should pass');
