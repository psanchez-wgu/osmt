import { Location } from "@angular/common"
import { HttpClient, HttpResponse } from "@angular/common/http"
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing"
import { async, TestBed } from "@angular/core/testing"
import { Router } from "@angular/router"
import {
  createMockCollection,
  createMockCollectionUpdate,
  createMockPaginatedCollections,
  createMockPaginatedSkills,
  createMockTaskResult
} from "../../../../test/resource/mock-data"
import { AuthServiceData, AuthServiceStub, RouterData, RouterStub } from "../../../../test/resource/mock-stubs"
import { AppConfig } from "../../app.config"
import { AuthService } from "../../auth/auth-service"
import { EnvironmentService } from "../../core/environment.service"
import { PublishStatus } from "../../PublishStatus"
import { ApiSortOrder } from "../../richskill/ApiSkill"
import { IStringListUpdate } from "../../richskill/ApiSkillUpdate"
import { PaginatedCollections, PaginatedSkills } from "../../richskill/service/rich-skill-search.service"
import { ApiTaskResult, ITaskResult } from "../../task/ApiTaskResult"
import { ApiCollection, ApiCollectionUpdate } from "../ApiCollection"
import { CollectionService } from "./collection.service"


describe("CollectionService", () => {
  let httpClient: HttpClient
  let httpTestingController: HttpTestingController
  let router: RouterStub
  let authService: AuthServiceStub
  let testService: CollectionService

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        EnvironmentService,
        AppConfig,
        CollectionService,
        Location,
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: Router, useClass: RouterStub }
      ]
    })
    .compileComponents()

    const appConfig = TestBed.inject(AppConfig)
    AppConfig.settings = appConfig.defaultConfig()  // This avoids the race condition on reading the config's whitelabel.toolName

    httpClient = TestBed.inject(HttpClient)
    httpTestingController = TestBed.inject(HttpTestingController)
    router = TestBed.inject(Router)
    authService = TestBed.inject(AuthService)
    testService = TestBed.inject(CollectionService)
  }))

  afterEach(() => {
    httpTestingController.verify()
  })

  it("should be created", () => {
    expect(testService).toBeTruthy()
  })

  it("getCollections should return", () => {
    // Arrange
    RouterData.commands = []
    AuthServiceData.isDown = false
    const path = "api/collections?sort=name.asc&status=Draft&size=3&from=0"
    const testData: PaginatedCollections = createMockPaginatedCollections(3, 10)
    const statuses = new Set<PublishStatus>([ PublishStatus.Draft ])

    // Act
    // noinspection LocalVariableNamingConventionJS
    const result$ = testService.getCollections(testData.collections.length, 0, statuses, ApiSortOrder.NameAsc)

    // Assert
    result$
      .subscribe((data: PaginatedCollections) => {
        expect(data).toEqual(testData)
        expect(RouterData.commands).toEqual([ ])  // No errors
        expect(AuthServiceData.isDown).toEqual(false)
      })

    const req = httpTestingController.expectOne(AppConfig.settings.baseApiUrl + "/" + path)
    expect(req.request.method).toEqual("GET")
    req.flush(testData.collections, {
      headers: { "x-total-count": "" + testData.totalCount}
    })
  })

  it("getCollectionByUUID should return", () => {
    // Arrange
    RouterData.commands = []
    AuthServiceData.isDown = false
    const uuid = "uuid1"
    const path = "api/collections/" + uuid
    const date = new Date("2020-06-25T14:58:46.313Z")
    const testData: ApiCollection = new ApiCollection(createMockCollection(date, date, date, date, PublishStatus.Draft))

    // Act
    // noinspection LocalVariableNamingConventionJS
    const result$ = testService.getCollectionByUUID(uuid)

    // Assert
    result$
      .subscribe((data: ApiCollection) => {
        expect(data).toEqual(testData)
        expect(RouterData.commands).toEqual([ ])  // No errors
        expect(AuthServiceData.isDown).toEqual(false)
      })

    const req = httpTestingController.expectOne(AppConfig.settings.baseApiUrl + "/" + path)
    expect(req.request.method).toEqual("GET")
    req.flush(testData)
  })

  it("getCollectionJson should return", () => {
    // Arrange
    RouterData.commands = []
    AuthServiceData.isDown = false
    const uuid = "uuid1"
    const path = "api/collections/" + uuid
    const date = new Date("2020-06-25T14:58:46.313Z")
    const testData: ApiCollection = new ApiCollection(createMockCollection(date, date, date, date, PublishStatus.Draft))

    // Act
    // noinspection LocalVariableNamingConventionJS
    const result$ = testService.getCollectionJson(uuid)

    // Assert
    result$
      .subscribe((data: string) => {
        expect(data).toEqual(JSON.stringify(testData))
        expect(RouterData.commands).toEqual([ ])  // No errors
        expect(AuthServiceData.isDown).toEqual(false)
      })

    const req = httpTestingController.expectOne(AppConfig.settings.baseApiUrl + "/" + path)
    expect(req.request.method).toEqual("GET")
    req.flush(testData)
  })
  it("getCollectionJson should not return", () => {
    // Arrange
    const uuid: string = undefined as unknown as string
    const path = "api/collections/" + uuid

    // Act
    try {
      const result$ = testService.getCollectionJson(uuid)
    } catch (e) {
      expect(e instanceof Error).toBeTrue()
      expect(e.message).toEqual("No uuid provided for collection json export")
    }

    // Assert
    const req = httpTestingController.expectNone(AppConfig.settings.baseApiUrl + "/" + path)
  })

  it("getCollectionSkillsCsv should return", () => {
    // Arrange
    RouterData.commands = []
    AuthServiceData.isDown = false
    const uuid = "f6aacc9e-bfc6-4cc9-924d-c7ef83afef07"
    const path = "api/collections/" + uuid + "/csv"
    const testData = createMockTaskResult()
    const expected = new ApiTaskResult(testData)

    // Act
    const result$ = testService.requestCollectionSkillsCsv(uuid)

    // Assert
    result$
      .subscribe((data: ITaskResult) => {
        expect(data).toEqual(expected)
        expect(RouterData.commands).toEqual([ ])  // No errors
        expect(AuthServiceData.isDown).toEqual(false)
      })

    const req = httpTestingController.expectOne(AppConfig.settings.baseApiUrl + "/" + path)
    expect(req.request.method).toEqual("GET")
    req.flush(testData)
  })
  it("getCollectionSkillsCsv should not return", () => {
    // Arrange
    RouterData.commands = []
    AuthServiceData.isDown = false
    const uuid: string = undefined as unknown as string
    const path = "api/collections/" + uuid + "/csv"
    const testData = createMockTaskResult()
    const expected = new ApiTaskResult(testData)

    // Act
    try {
      const result$ = testService.requestCollectionSkillsCsv(uuid)
    } catch (e) {
      expect(e instanceof Error).toBeTrue()
      expect(e.message).toEqual("Invalid collection uuid.")
    }

    // Assert
    const req = httpTestingController.expectNone(AppConfig.settings.baseApiUrl + "/" + path)
  })

  it("getCsvTaskResultsIfComplete should return", () => {
    // Arrange
    RouterData.commands = []
    AuthServiceData.isDown = false
    const uuid = "f6aacc9e-bfc6-4cc9-924d-c7ef83afef07"
    const path = "api/results/text/" + uuid
    const testData = { foo: "bar" }
    const expected = testData

    // Act
    const result$ = testService.getCsvTaskResultsIfComplete(uuid)

    // Assert
    result$
      .subscribe((data: HttpResponse<{ foo: string}>) => {
        expect(data.body?.toString()).toEqual(JSON.stringify(expected))
        expect(RouterData.commands).toEqual([ ])  // No errors
        expect(AuthServiceData.isDown).toEqual(false)
      })

    const req = httpTestingController.expectOne(AppConfig.settings.baseApiUrl + "/" + path)
    expect(req.request.method).toEqual("GET")
    req.flush(testData)
  })

  it("getCollectionSkills should return", () => {
    // Arrange
    RouterData.commands = []
    AuthServiceData.isDown = false
    const uuid = "f6aacc9e-bfc6-4cc9-924d-c7ef83afef07"
    const path = "api/collections/" + uuid + "/skills?sort=undefined"
    const testData = createMockPaginatedSkills()
    const expected = testData

    // Act
    const result$ = testService.getCollectionSkills(uuid)

    // Assert
    result$
      .subscribe((data: PaginatedSkills) => {
        expect(data).toEqual(expected)
        expect(RouterData.commands).toEqual([ ])  // No errors
        expect(AuthServiceData.isDown).toEqual(false)
      })

    const req = httpTestingController.expectOne(AppConfig.settings.baseApiUrl + "/" + path)
    expect(req.request.method).toEqual("POST")
    req.flush(testData.skills, {
      headers: { "x-total-count": "" + testData.totalCount}
    })
  })

  it("createCollection should return", () => {
    // Arrange
    RouterData.commands = []
    AuthServiceData.isDown = false
    const path = "api/collections"
    const now = new Date()
    const testData = [
      new ApiCollection(createMockCollection(
        now, now, now, now,
        PublishStatus.Draft
        // The default is to have some skills
      ))
    ]
    const stringListUpdate: IStringListUpdate = { add: [], remove: [] }
    const expected = testData[0]
    expected.skills.forEach(s => stringListUpdate.add?.push(s))
    const input = new ApiCollectionUpdate({
      name: expected.name,
      status: expected.status,
      author: expected.author,
      skills: stringListUpdate
    })

    // Act
    const result$ = testService.createCollection(input)

    // Assert
    result$
      .subscribe((data: ApiCollection) => {
        expect(data).toEqual(expected)
        expect(RouterData.commands).toEqual([ ])  // No errors
        expect(AuthServiceData.isDown).toEqual(false)
      })

    const req = httpTestingController.expectOne(AppConfig.settings.baseApiUrl + "/" + path)
    expect(req.request.method).toEqual("POST")
    req.flush(testData)
  })

  it("updateCollection should return", () => {
    // Arrange
    RouterData.commands = []
    AuthServiceData.isDown = false
    const now = new Date()
    const testData = new ApiCollection(createMockCollection(
        now, now, now, now,
        PublishStatus.Draft
        // The default is to have some skills
      ))
    const stringListUpdate: IStringListUpdate = { add: [], remove: [] }
    const expected = testData
    const uuid = expected.uuid
    const path = "api/collections/" + uuid + "/update"
    expected.skills.forEach(s => stringListUpdate.add?.push(s))
    const input = new ApiCollectionUpdate({
      name: expected.name,
      status: expected.status,
      author: expected.author,
      skills: stringListUpdate
    })

    // Act
    const result$ = testService.updateCollection(uuid, input)

    // Assert
    result$
      .subscribe((data: ApiCollection) => {
        expect(data).toEqual(expected)
        expect(RouterData.commands).toEqual([ ])  // No errors
        expect(AuthServiceData.isDown).toEqual(false)
      })

    const req = httpTestingController.expectOne(AppConfig.settings.baseApiUrl + "/" + path)
    expect(req.request.method).toEqual("POST")
    req.flush(testData)
  })
})