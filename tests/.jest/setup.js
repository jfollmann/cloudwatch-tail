jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn())
jest.spyOn(global.console, 'table').mockImplementation(() => jest.fn())

jest.mock('simple-output')
