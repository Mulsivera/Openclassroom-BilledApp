/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

global.alert = jest.fn()
global.setImmediate = fn => setTimeout(fn, 0)

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: (key) => {
      if (key === "user") {
        return JSON.stringify({ email: "test@test.com" })
      }
      return null
    }
  }
})

describe("NewBill", () => {
  let component
  let createMock
  let updateMock
  let billsMock

  beforeEach(() => {
    document.body.innerHTML = NewBillUI()

    createMock = jest.fn(() =>
      Promise.resolve({ fileUrl: "url", key: "123" })
    )

    updateMock = jest.fn(() => Promise.resolve())

    billsMock = jest.fn(() => ({
      create: createMock,
      update: updateMock
    }))

    const store = {
      bills: billsMock
    }

    component = new NewBill({
      document,
      onNavigate: jest.fn(),
      store,
      localStorage: window.localStorage
    })
  })

  test("should render form", () => {
    expect(screen.getByTestId("form-new-bill")).toBeInTheDocument()
  })

  test("should alert when file extension is invalid", () => {
    const input = screen.getByTestId("file")

    const file = new File(["x"], "test.pdf", {
      type: "application/pdf"
    })

    Object.defineProperty(input, "files", {
      value: [file]
    })

    input.dispatchEvent(new Event("change"))

    expect(global.alert).toHaveBeenCalled()
  })

  test("should upload valid file and set data", async () => {
    const input = screen.getByTestId("file")

    const file = new File(["img"], "test.png", {
      type: "image/png"
    })

    Object.defineProperty(input, "files", {
      value: [file]
    })

    input.dispatchEvent(new Event("change"))

    await new Promise(setImmediate)

    expect(component.fileName).toBe("test.png")
    expect(component.fileUrl).toBe("url")
  })

  test("should submit form and call update", async () => {
    component.fileUrl = "url"
    component.fileName = "test.png"
    component.billId = "123"

    const form = screen.getByTestId("form-new-bill")

    form.dispatchEvent(new Event("submit"))

    await new Promise(setImmediate)

    expect(updateMock).toHaveBeenCalled()
  })

  test("should alert when update returns 400", async () => {
    component.fileUrl = "url"
    component.fileName = "test.png"
    component.billId = "123"

    updateMock.mockRejectedValue({
      response: {
        status: 400
      }
    })

    const form = screen.getByTestId("form-new-bill")

    form.dispatchEvent(new Event("submit"))

    await new Promise(setImmediate)

    expect(updateMock).toHaveBeenCalled()

    expect(global.alert).toHaveBeenCalledWith(
      "Erreur lors de l'envoi de la note de frais."
    )
  })

  test("integration POST new bill", async () => {
    const input = screen.getByTestId("file")

    const file = new File(["img"], "test.png", {
      type: "image/png"
    })

    Object.defineProperty(input, "files", {
      value: [file]
    })

    input.dispatchEvent(new Event("change"))

    await new Promise(setImmediate)

    const form = screen.getByTestId("form-new-bill")

    screen.getByTestId("expense-type").value = "Travel"
    screen.getByTestId("expense-name").value = "Train"
    screen.getByTestId("amount").value = "100"
    screen.getByTestId("datepicker").value = "2026-01-01"
    screen.getByTestId("vat").value = "20"
    screen.getByTestId("pct").value = "10"
    screen.getByTestId("commentary").value = "test"

    form.dispatchEvent(new Event("submit"))

    await new Promise(setImmediate)

    expect(createMock).toHaveBeenCalled()
    expect(updateMock).toHaveBeenCalled()
  })
})